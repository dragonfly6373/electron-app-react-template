var url_pattern = "https://docs.fedoraproject.org";
var roottab = null;

var browser = chrome;

browser.runtime.onMessage.addListener(async (message, sender, senderResponse) => {
    console.log("# new message:", message, sender, url_pattern);
    browser.storage.local.get("url_pattern").then(data => {
        url_pattern = data?.url_pattern;
    });
});

browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    if (!tab.url?.startsWith(url_pattern)) return;
    if (!roottab) roottab = tab;
    if (roottab?.id != tab.id && tab.url?.startsWith(url_pattern)) {
        console.log("tab updated", id, tab.url, url_pattern, changeInfo);
        if (!changeInfo.url) return;
        browser.tabs.remove([tab.id]);
        browser.tabs.update(roottab.id, {url: changeInfo.url});
    }
});
