/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import {screen} from "@testing-library/dom";
import {loadHtmlAndScript} from "../../../testing/MoreTesting";
import {userEvent} from "@testing-library/user-event";

let user;
let xhrMock;

beforeEach(async () => {
  user = userEvent.setup();
  xhrMock = {
    open: jest.fn(),
    send: jest.fn().mockImplementation(function () {
      this.onreadystatechange();
    }),
  };
  jest.spyOn(window, "XMLHttpRequest").mockImplementation(() => xhrMock);
});

test("Should load joke when page loads", async () => {
  xhrMock.readyState = 4;
  xhrMock.status = 200;
  xhrMock.responseText = JSON.stringify({
    "icon_url": "https://assets.chucknorris.host/img/avatar/chuck-norris.png",
    "id": "QdSqidubQ027nhIWwguGxA",
    "url": "https://api.chucknorris.io/jokes/QdSqidubQ027nhIWwguGxA",
    "value": "Some random Chuck Norris joke."
  });
  await loadPage();

  let joke = await screen.findByTestId("joke");
  expect(xhrMock.open).toHaveBeenCalledTimes(1);
  expect(xhrMock.open).toHaveBeenCalledWith("GET", "https://api.chucknorris.io/jokes/random");
  expect(joke).toHaveTextContent("Some random Chuck Norris joke.");
});

describe("When button clicked", () => {

  beforeEach(async () => {
    await loadHtmlAndScript(
      "./javascript-sandbox-start/09-asynchronous-javascript/05-joke-generator-challenge/chuck-joke-generator-start/index.html",
      "./javascript-sandbox-start/09-asynchronous-javascript/05-joke-generator-challenge/chuck-joke-generator-start/script.js"
    );
  });

  test("Should display 'Loading...' while HTTP request is not finished yet", async () => {
    xhrMock.readyState = 3;

    await user.click(screen.getByRole("button"));

    let joke = await screen.findByTestId("joke");
    expect(xhrMock.open).toHaveBeenCalledTimes(2);
    expect(xhrMock.open).toHaveBeenNthCalledWith(2,"GET", "https://api.chucknorris.io/jokes/random");
    expect(joke).toHaveTextContent("Loading...");
  });

  test("Should display a random Chuck Norris joke when HTTP response is ready", async () => {
    xhrMock.readyState = 4;
    xhrMock.status = 200;
    xhrMock.responseText = JSON.stringify({
      "icon_url" : "https://assets.chucknorris.host/img/avatar/chuck-norris.png",
      "id" : "QdSqidubQ027nhIWwguGxA",
      "url" : "https://api.chucknorris.io/jokes/QdSqidubQ027nhIWwguGxA",
      "value" : "Some random Chuck Norris joke."
    });

    await user.click(screen.getByRole("button"));

    let joke = await screen.findByTestId("joke");
    expect(xhrMock.open).toHaveBeenCalledTimes(2);
    expect(xhrMock.open).toHaveBeenNthCalledWith(2,"GET", "https://api.chucknorris.io/jokes/random");
    expect(joke).toHaveTextContent("Some random Chuck Norris joke.");
  });

  test("Should display an error message when HTTP response is ready but not successful", async () => {
    xhrMock.readyState = 4;
    xhrMock.status = 500;

    await user.click(screen.getByRole("button"));

    let joke = await screen.findByTestId("joke");
    expect(xhrMock.open).toHaveBeenCalledTimes(2);
    expect(xhrMock.open).toHaveBeenNthCalledWith(2,"GET", "https://api.chucknorris.io/jokes/random");
    expect(joke).toHaveTextContent("Sorry, we couldn't get a joke");
  });
});

async function loadPage() {
  await loadHtmlAndScript(
    "./javascript-sandbox-start/09-asynchronous-javascript/05-joke-generator-challenge/chuck-joke-generator-start/index.html",
    "./javascript-sandbox-start/09-asynchronous-javascript/05-joke-generator-challenge/chuck-joke-generator-start/script.js"
  );
}
