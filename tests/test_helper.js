const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "Hii",
    author: "Hii",
    url: "hiipistecom",
    likes: 8,
  },
  {
    title: "Hoo",
    author: "Hoo",
    url: "hooPisteCom",
    likes: 7,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: "eiJaaKantaan",
    author: "eiJaaKantaan",
    url: "eiJaaKantaanDotCom",
    likes: 100,
  });
  await blog.save();
  await blog.remove();

  console.log("nonExistingId - blog._id.toString() ", blog._id.toString());

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
};
