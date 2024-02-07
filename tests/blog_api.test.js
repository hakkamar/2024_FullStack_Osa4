const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

test("blogs are returned as json (teht. 4.8)", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned (teht. 4.8)", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test("blogs are identifyied with id and not with _id (teht. 4.9)", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToView = blogsAtStart[0];

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  expect(resultBlog.body.id).toBeDefined();
  expect(resultBlog.body._id).not.toBeDefined();
});

test("a specific blog is within the returned blogs", async () => {
  const response = await api.get("/api/blogs");
  const titles = response.body.map((r) => r.title);
  //expect(titles).toContain("Hii");
  expect(titles).toContainEqual("Hii");
});

test("a valid blog can be added (teht. 4.10)", async () => {
  const newBlog = {
    title: "Tst",
    author: "Tst",
    url: "tstPisteCom",
    likes: 1,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const titles = blogsAtEnd.map((n) => n.title);
  //expect(titles).toContain("Tst");
  expect(titles).toContainEqual("Tst");
});

test("a blog added without likes is zero (teht. 4.11)", async () => {
  const newBlog = {
    title: "zeroTst",
    author: "zeroTst",
    url: "zerotstPisteCom",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const addedBlog = blogsAtEnd.find(
    (n) =>
      n.title === newBlog.title &&
      n.author === newBlog.author &&
      n.url === newBlog.url
  );
  expect(addedBlog.likes).toEqual(0);
});

test("blog without title is not added (teht. 4.12)", async () => {
  const newBlog = {
    author: "Tst",
    url: "tstPisteCom",
    likes: 1,
  };
  await api.post("/api/blogs").send(newBlog).expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test("blog without url is not added (teht. 4.12)", async () => {
  const newBlog = {
    title: "Testi",
    author: "Testi",
    likes: 12,
  };
  await api.post("/api/blogs").send(newBlog).expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test("a specific blog can be viewed", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToView = blogsAtStart[0];

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  expect(resultBlog.body).toEqual(blogToView);
});

test("a blog can be deleted", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

  const titles = blogsAtEnd.map((r) => r.title);
  //expect(titles).not.toContain(blogToDelete.title);
  expect(titles).not.toContainEqual(blogToDelete.title);
});

afterAll(async () => {
  await mongoose.connection.close();
});
