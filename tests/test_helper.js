const Blog = require("../models/blog");
const User = require("../models/user");

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
  //await blog.remove();
  await blog.deleteOne();

  //console.log("nonExistingId - blog._id.toString() ", blog._id.toString());
  //console.log("nonExistingId - blog.id.toString() ", blog.id.toString());
  //console.log("nonExistingId - blog.id ", blog.id);
  //console.log("nonExistingId - blog ", blog);

  return blog._id.toString();
  //return blog.id;
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
