const Koa = require("koa");
const fs = require("fs");
const path = require("path");
const app = new Koa();

app.use(async (ctx) => {
  const { url, query } = ctx.request;
  if (url === "/") {
    ctx.type = "text/html";
    const content = fs.readFileSync("./index.html", "utf-8");
    ctx.body = content;
  } else if (url.endsWith(".js")) {
    // /src/main.js => <path>/src/main.js
    const _path = path.resolve(__dirname, url.slice(1));
    const content = fs.readFileSync(_path, "utf-8");
    ctx.type = "application/javascript";
    ctx.body = content;
  }
});

app.listen(3000, () => {
  console.log("Vite is listening on port 3000");
});
