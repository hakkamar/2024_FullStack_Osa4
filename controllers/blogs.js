const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
//const User = require("../models/user");
//const jwt = require("jsonwebtoken");

const middleware = require("../utils/middleware");

let voiPoistaa = false;
let uudetBlogit = null;
let indexi = 0;

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
  const body = request.body;
  const user = request.user;
  if (user === null) {
    return response.status(401).json({ error: "token invalid" });
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete(
  "/:id",
  middleware.userExtractor,
  async (request, response) => {
    const user = request.user;
    if (user === null) {
      return response.status(401).json({ error: "token invalid" });
    }

    voiPoistaa = false;
    uudetBlogit = null;
    indexi = 0;
    for (let i = 0; i < user.blogs.length; i++) {
      if (user.blogs[i].toString() === request.params.id) {
        indexi = i;
        voiPoistaa = true;
        break;
      }
    }

    if (voiPoistaa) {
      await Blog.findByIdAndDelete(request.params.id);
      uudetBlogit = user.blogs.toSpliced(indexi, 1);
      user.blogs = uudetBlogit;
      await user.save();

      response.status(204).end();
    } else {
      response.status(401).json({ error: "only own blogs can be deleted" });
    }
  }
);

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  if (updatedBlog) {
    response.json(updatedBlog);
  } else {
    response.status(404).end();
  }
});

module.exports = blogsRouter;
