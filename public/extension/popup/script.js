var browser = chrome;

function saveUrl(value) {
    console.log("# save url_pattern", value);
    browser.storage.local.set({url_pattern: value});
    browser.runtime.sendMessage({url_pattern: value}).then(console.log, console.log);
}

document.addEventListener("DOMContentLoaded", (event) => {
    console.log("# DOMContentLoaded");
    var txtInputUrl = document.getElementById("txtInputUrl");
    var btnSave = document.getElementById("btnSave");
    txtInputUrl.addEventListener("keypress", (event) => {
        if (event.code === "Enter") saveUrl(txtInputUrl.value);
    });
    btnSave.addEventListener("click", () => saveUrl(txtInputUrl.value));
    browser.storage.local.get("url_pattern").then((data) => {
        document.getElementById("txtInputUrl").value = data.url_pattern;
    });
});
