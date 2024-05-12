/**
 * @jest-environment jsdom
 */

const { getCurrentLocalPage} = require("./script");

test.each([
  {
    locationPathname: "/javascript-sandbox/app-project/index.html",
    localPage: "index.html"
  },
  {
    locationPathname: "/index.html",
    localPage: "index.html"
  },
  {
    locationPathname: "/",
    localPage: ""
  },
  {
    locationPathname: "",
    localPage: ""
  }
])("getCurrentLocalPage('$locationPathname') should return '$localPage'", ({locationPathname, localPage}) => {
  expect(getCurrentLocalPage(locationPathname)).toBe(localPage);
});