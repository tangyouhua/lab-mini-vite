// import { str } from "./moduleA.js";
// console.log("vite ..." + str);

import { createApp, h } from "vue";
import App from "./App.vue";
import "./index.css";
// const app = {
//   render() {
//     // <div><div>Hello Vite</div></div>
//     return h("div", null, [h("div", null, String("Hello Vite"))]);
//   },
// };
createApp(App).mount("#app");
