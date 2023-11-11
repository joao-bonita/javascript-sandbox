const {loadJsDomFromFile} = require("../../../testing/Testing");

let window;

beforeEach(async () => {
  window = (await loadJsDomFromFile(
    "./javascript-sandbox-start/07-events/05-event-keycode-project/event-keycodes/index.html"
  )).window;
});

afterEach(() => {
  window.close();
});

test("Pressing a key should update the key box with the value of that key", done => {
  const keyBox = window.document.querySelector("#insert").children[0];
  const keyBoxContent = keyBox.childNodes[0];

  window.addEventListener("keypress", function () {
    try {
      expect(keyBoxContent.textContent.trim()).toBe("z");
      done();
    } catch (e) {
      done(e);
    }
  });

  window.dispatchEvent(zedKeypress());
});

test("Pressing a key should update the key code box with the keyCode of that key", done => {
  const keyCodeBox = window.document.querySelector("#insert").children[1];
  const keyCodeBoxContent = keyCodeBox.childNodes[0];

  window.addEventListener("keypress", function () {
    try {
      expect(keyCodeBoxContent.textContent.trim()).toBe("90");
      done();
    } catch (e) {
      done(e);
    }
  });

  window.dispatchEvent(zedKeypress());
});

test("Pressing a key should update the code box with the code of that key", done => {
  const codeBox = window.document.querySelector("#insert").children[2];
  const codeBoxContent = codeBox.childNodes[0];

  window.addEventListener("keypress", function () {
    try {
      expect(codeBoxContent.textContent.trim()).toBe("KeyZ");
      done();
    } catch (e) {
      done(e);
    }
  });

  window.dispatchEvent(zedKeypress());
});

function zedKeypress() {
  return new window.KeyboardEvent("keypress", {key: "z", keyCode: 90, code: "KeyZ"});
}
