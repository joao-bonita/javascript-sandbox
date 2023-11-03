const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function loadJsDomFromFile(filepath){
  const dom = await JSDOM.fromFile(
    // `../../${filepath}`,
    filepath,
    {
      resources: "usable",
      runScripts: "dangerously"
    });
  await new Promise(resolve =>
    dom.window.addEventListener("load", resolve)
  );
  return dom;
}

module.exports = {
  loadJsDomFromFile : loadJsDomFromFile
};

