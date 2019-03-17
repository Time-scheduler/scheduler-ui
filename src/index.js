import React from "react";
import { render } from "react-dom";
import App from "./components/app";

const rootEl = document.getElementById("root");

render(<App />, rootEl);

if (module.hot) {
  module.hot.accept();
}
