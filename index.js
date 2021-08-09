// Requirements
const fs = require("fs");
const url = require("url");
const http = require("http");

// Functions

// Server Logic
const server = http.createServer((req, res) => {
  const pathName = req.url;
  res.end(pathName);
  console.log(pathName);

  // home or /
  // Serve home page
  // Detail Page
  // Determine which page was requested and serve
  // Unknown Page
  // Serve back a 404 error.
});

server.listen(8000, `127.0.0.1`, () => {
  console.log(`Server online`);
});
