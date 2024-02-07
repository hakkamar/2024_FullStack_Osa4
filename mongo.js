const mongoose = require("mongoose");
//const punycode = require("punycode/");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
//const url = `mongodb+srv://fullstack:${password}@cluster0.w6tnp3q.mongodb.net/blogApp?retryWrites=true&w=majority`;
const url = `mongodb+srv://fullstack:${password}@cluster0.w6tnp3q.mongodb.net/testBlogApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});
const Blog = mongoose.model("Blog", blogSchema);

console.log("-------------");

if (process.argv.length < 4) {
  console.log("Blogit:");
  Blog.find({}).then((result) => {
    result.forEach((blog) => {
      console.log(blog.title, " ", blog.author, " ", blog.url, " ", blog.likes);
    });
    console.log("-------------");
    mongoose.connection.close();
  });
} else {
  const parametriTitle = process.argv[3];
  const parametriAuthor = process.argv[4];
  const parametriUrl = process.argv[5];

  const blog = new Blog({
    title: parametriTitle,
    author: parametriAuthor,
    url: parametriUrl || "xxx",
    likes: 0,
  });

  blog.save().then((result) => {
    console.log(`added ${parametriTitle} author ${parametriAuthor} to blogs`);
    console.log("-------------");
    mongoose.connection.close();
  });
}
