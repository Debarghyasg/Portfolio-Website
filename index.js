const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Home
app.get("/", (req, res) => {
  res.render("index", {
    currentPath: "/",
    pageTitle: "Debarghya Sengupta — Developer, Cloud & AI Builder",
    pageDescription:
      "Personal portfolio of Debarghya Sengupta — a passionate developer building full-stack web, cloud, and AI experiences.",
  });
});

// Projects
app.get("/projects", (req, res) => {
  res.render("project", {
    currentPath: "/projects",
    pageTitle: "Projects — Debarghya Sengupta",
    pageDescription:
      "A selection of projects spanning AI fraud detection, RAG platforms, healthcare and crop disease diagnosis.",
  });
});

// Skills
app.get("/skills", (req, res) => {
  res.render("skills", {
    currentPath: "/skills",
    pageTitle: "Skills — Debarghya Sengupta",
    pageDescription:
      "Full-stack web, cloud, and DSA skills — languages, frameworks, databases, cloud platforms, and tools.",
  });
});

// Legacy aliases that previously rendered the home page
app.get("/projects/home", (req, res) => res.redirect("/"));
app.get("/skills/home", (req, res) => res.redirect("/"));

// 404
app.use((req, res) => {
  res
    .status(404)
    .render("not-found", {
      currentPath: req.path,
      pageTitle: "Page not found — Debarghya Sengupta",
      pageDescription: "The page you are looking for does not exist.",
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
