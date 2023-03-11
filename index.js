const Koa = require("koa");
const fs = require("fs");
const path = require("path");
const app = new Koa();
const compilerSfc = require("@vue/compiler-sfc");
const compilerDom = require("@vue/compiler-dom");

app.use(async (ctx) => {
  const { url, query } = ctx.request;
  if (url === "/") {
    ctx.type = "text/html";
    let content = fs.readFileSync("./index.html", "utf-8");
    content = content.replace(
      "<script",
      `<script>window.process={env:{NODE_ENV:'dev'}}</script><script`
    );
    ctx.body = content;
  } else if (url.endsWith(".js")) {
    // /src/main.js => <path>/src/main.js
    const _path = path.resolve(__dirname, url.slice(1));
    const content = fs.readFileSync(_path, "utf-8");
    ctx.type = "application/javascript";
    ctx.body = rewriteImport(content);
  } else if (url.startsWith("/@modules")) {
    // 3rd-party libraries
    // /@modules/vue => vue es module entry in node_modules/
    const prefix = path.resolve(
      __dirname,
      "node_modules",
      url.replace("/@modules/", "")
    );
    const module = require(prefix + "/package.json").module;
    const p = path.resolve(prefix, module);
    const ret = fs.readFileSync(p, "utf-8");
    ctx.type = "application/javascript";
    ctx.body = rewriteImport(ret);
  } else if (url.indexOf(".vue") > -1) {
    // support SFC component
    // step 1. *.vue => template script (compiler-sfc)
    // /*.vue?type=template
    const p = path.resolve(__dirname, url.split("?")[0].slice(1));
    const { descriptor } = compilerSfc.parse(fs.readFileSync(p, "utf-8"));
    if (!query.type) {
      ctx.type = "application/javascript";
      ctx.body = `${rewriteImport(
        descriptor.script.content.replace("export default", "const __script = ")
      )}
  import { render as __render } from "${url}?type=template"
  __script.render = __render;
  export default __script;
  `;
    } else {
      // step 2. template => render func (compiler-dom)
      const template = descriptor.template;
      const render = compilerDom.compile(template.content, { mode: "module" });
      ctx.type = "application/javascript";
      ctx.body = rewriteImport(render.code);
    }
  } else if (url.endsWith(".css")) {
    // css => js, add <style>
    const p = path.resolve(__dirname, url.slice(1));
    const file = fs.readFileSync(p, "utf-8");

    const content = `
    const css = "${file.replace(/\n/g, "")}";
    let link = document.createElement('style');
    link.setAttribute('type', 'text/css');
    document.head.appendChild(link);
    link.innerHTML = css;
    export default css;
    `;
    ctx.type = "application/javascript";
    ctx.body = content;
  }

  // vue => node_modules/***

  // hack request: 'vue' => /@modules/vue => alias
  function rewriteImport(content) {
    return content.replace(/ from ['|"]([^'"]+)['|"]/g, function (s0, s1) {
      if (s1[0] !== "." && s1[1] !== "/") {
        return ` from '/@modules/${s1}'`;
      } else {
        return s0;
      }
    });
  }
});

app.listen(3000, () => {
  console.log("Vite is listening on port 3000");
});
