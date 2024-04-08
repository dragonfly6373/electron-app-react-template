"use strict";
(() => {
  // src/common/config/index.ts
  var config = {
    someKey: "someValue"
  };

  // src/background/index.ts
  console.log(`Service worker`, config);
  chrome.storage.local.onChanged.addListener((changes) => {
    console.log("Storage changed", changes);
  });
})();
