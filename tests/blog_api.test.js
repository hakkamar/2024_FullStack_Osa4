const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

const jwt = require("jsonwebtoken");

const Blog = require("../models/blog");
const User = require("../models/user");

let toukka = "";
let juuseri = "";

describe("when there is initially some notes saved", () => {
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
    expect(titles).toContainEqual("Hii");
  });

  describe("viewing a specific blog", () => {
    test("succeeds with a valid id", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToView = blogsAtStart[0];

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(resultBlog.body).toEqual(blogToView);
    });

    test("fails with statuscode 404 if blog does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
    });

    test("fails with statuscode 400 malformatted id", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      await api.get(`/api/blogs/${invalidId}`).expect(400);
    });
  });

  describe("updating of a blog", () => {
    test("adding likes success with statuscode 200 (teht. 4.14)", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const ekaBlogi = blogsAtStart[0];
      const blogToUpdate = {
        id: ekaBlogi.id,
        title: ekaBlogi.title,
        author: ekaBlogi.author,
        url: ekaBlogi.author,
        likes: ekaBlogi.likes + 1,
      };

      await api.put(`/api/blogs/${blogToUpdate.id}`).expect(200);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
      expect(ekaBlogi.likes).toEqual(blogToUpdate.likes - 1);
    });

    test("fails with statuscode 404 with non existing id (teht. 4.14)", async () => {
      const validNonexistingId = await helper.nonExistingId();
      await api.put(`/api/blogs/${validNonexistingId}`).expect(404);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });

    test("fails with statuscode 400 if id is NOT valid (teht. 4.14)", async () => {
      const fakeId = "xxxxxxxxxxxxxxxxx";
      await api.put(`/api/blogs/${fakeId}`).expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });
  });

  describe("when there is initially one user at db", () => {
    beforeEach(async () => {
      await User.deleteMany({});

      const passwordHash = await bcrypt.hash("sekret", 10);
      const user = new User({
        username: "root",
        name: "Root user",
        passwordHash,
      });

      await user.save();
    });

    test("creation succeeds with a fresh username", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "mluukkai",
        name: "Matti Luukkainen",
        password: "salainen",
      };

      await api
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

      const usernames = usersAtEnd.map((u) => u.username);
      expect(usernames).toContain(newUser.username);
    });

    test("creation fails with proper statuscode and message if username already taken", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "root",
        name: "Superuser",
        password: "salainen",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(result.body.error).toContain("expected `username` to be unique");

      const usersAtEnd = await helper.usersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test("creation fails with proper statuscode and message if username is missing", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        name: "Richard Stanley",
        password: "sas",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(result.body.error).toContain(
        "User validation failed: username: Path `username` is required."
      );

      const usersAtEnd = await helper.usersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test("creation fails with proper statuscode and message if username is too short", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "mr",
        name: "Richard Stanley",
        password: "sas",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(result.body.error).toContain(
        "User validation failed: username: Path `username` (`mr`) is shorter than the minimum allowed length (3)."
      );

      const usersAtEnd = await helper.usersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test("creation fails with proper statuscode and message if password is missing", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "misterX",
        name: "Richard Stanley",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(result.body.error).toContain("password missing");

      const usersAtEnd = await helper.usersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test("creation fails with proper statuscode and message if password is too short", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "misterX",
        name: "Richard Stanley",
        password: "sa",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(result.body.error).toContain(
        "password too short (minimum 3 characters)"
      );

      const usersAtEnd = await helper.usersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test("login success (status code 200) and return token", async () => {
      const loggautuvaUser = {
        username: "root",
        password: "sekret",
      };

      const result = await api
        .post("/api/login")
        .send(loggautuvaUser)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(result.body.token).not.toEqual("");
      expect(result.body.username).toEqual("root");
    });

    test("login fails (status code 401) with wrong password", async () => {
      const loggautuvaUser = {
        username: "root",
        password: "wrong",
      };

      await api.post("/api/login").send(loggautuvaUser).expect(401);
    });
  });

  describe("addition of a new blog", () => {
    beforeEach(async () => {
      await User.deleteMany({});

      const passwordHash = await bcrypt.hash("sekret", 10);
      const user = new User({
        username: "root",
        name: "Root user",
        passwordHash,
      });
      await user.save();

      const loggautuvaUser = {
        username: "root",
        password: "sekret",
      };
      const x = await api.post("/api/login").send(loggautuvaUser);
      toukka = "Bearer " + x.body.token;

      const decodedToken = jwt.verify(x.body.token, process.env.SECRET);
      juuseri = await User.findById(decodedToken.id);
    });

    test("blog without token fails with status code 401 (teht. 4.23)", async () => {
      const newBlog = {
        author: "Tst",
        url: "tstPisteCom",
        likes: 1,
      };
      await api.post("/api/blogs").send(newBlog).expect(401);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });

    test("blog without title fails with status code 400 (teht. 4.12)", async () => {
      const newBlog = {
        author: "Tst",
        url: "tstPisteCom",
        likes: 1,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", toukka)
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });

    test("blog without url fails with status code 400 (teht. 4.12)", async () => {
      const newBlog = {
        title: "Testi",
        author: "Testi",
        likes: 12,
      };
      await api
        .post("/api/blogs")
        .set("Authorization", toukka)
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });

    test("succeeds with valid data (teht. 4.10)", async () => {
      const iidee = juuseri._id;
      const newBlog = {
        title: "Tst",
        author: "Tst",
        url: "tstPisteCom",
        likes: 1,
        user: iidee,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", toukka)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

      const titles = blogsAtEnd.map((n) => n.title);
      expect(titles).toContainEqual("Tst");
    });

    test("a blog added without likes is zero (teht. 4.11)", async () => {
      const iidee = juuseri._id;
      const newBlog = {
        title: "zeroTst",
        author: "zeroTst",
        url: "zerotstPisteCom",
        user: iidee,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", toukka)
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
  });
  describe("deletion of a blog", () => {
    beforeEach(async () => {
      await User.deleteMany({});

      const passwordHash = await bcrypt.hash("sekret", 10);
      const user = new User({
        username: "root",
        name: "Root user",
        passwordHash,
      });
      await user.save();

      const loggautuvaUser = {
        username: "root",
        password: "sekret",
      };
      const x = await api.post("/api/login").send(loggautuvaUser);
      toukka = "Bearer " + x.body.token;

      const decodedToken = jwt.verify(x.body.token, process.env.SECRET);
      juuseri = await User.findById(decodedToken.id);

      const iidee = juuseri._id;
      const newBlog = {
        title: "zeroTst",
        author: "zeroTst",
        url: "zerotstPisteCom",
        user: iidee,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", toukka)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      juuseri = await User.findById(decodedToken.id);
    });

    test("succeeds with status code 204 if id is valid (teht. 4.13)", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[2];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", toukka)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

      const titles = blogsAtEnd.map((r) => r.title);
      //expect(titles).not.toContain(blogToDelete.title);
      expect(titles).not.toContainEqual(blogToDelete.title);
    });

    test("fails with statuscode 401 someone else's blog", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const notValidExisting = blogsAtStart[0];

      await api
        .delete(`/api/blogs/${notValidExisting.id}`)
        .set("Authorization", toukka)
        .expect(401);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    });

    test("fails with statuscode 401 if blog does not exist (ex-teht. 4.13)", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const validNonexistingId = await helper.nonExistingId();

      await api
        .delete(`/api/blogs/${validNonexistingId}`)
        .set("Authorization", toukka)
        .expect(401);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    });

    test("fails with statuscode 401 if id is NOT valid (ex-teht. 4.13)", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const fakeId = "xxxxxxxxxxxxxxxxx";
      await api
        .delete(`/api/blogs/${fakeId}`)
        .set("Authorization", toukka)
        .expect(401);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
