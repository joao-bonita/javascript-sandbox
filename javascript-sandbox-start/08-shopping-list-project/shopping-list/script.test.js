/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import {screen} from "@testing-library/dom";
import {userEvent} from "@testing-library/user-event";
import {promises as fs} from "fs";

test("Add Item' button should add an item to the top of the list", async () => {
  await loadHtmlAndScript(
    "./javascript-sandbox-start/08-shopping-list-project/shopping-list/index.html",
    "./javascript-sandbox-start/08-shopping-list-project/shopping-list/script.js");

  const itemsList = screen.getByTestId("item-list");

  const itemInput = screen.getByTestId("item-input");
  const user = userEvent.setup();
  await user.click(itemInput);
  // await user.type(itemInput, "Eggs");
});

async function loadHtmlAndScript(htmlFilepath, scriptFilepath) {
  await readHtmlBodyIntoJsDom(htmlFilepath);
  await addScriptToBody(scriptFilepath);
}

async function readHtmlBodyIntoJsDom(htmlFilepath) {
  const htmlContents = await fs.readFile(htmlFilepath, "utf8");
  const html= document.createElement("html");
  html.innerHTML = htmlContents;
  const newBody = html.querySelector("body");
  document.body.innerHTML = newBody.innerHTML;
}

async function addScriptToBody(scriptFilepath) {
  const scriptContents = await fs.readFile(scriptFilepath, "utf8");
  const scriptEl = document.createElement("script");
  scriptEl.textContent = scriptContents;
  document.body.appendChild(scriptEl);
}