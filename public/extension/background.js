var url_pattern = "https://docs.fedoraproject.org/en-US/docs/";
var roottab = null;

browser.runtime.onMessage.addListener(async (message, sender, senderResponse) => {
    console.log("# new message:", message, sender, url_pattern);
    url_pattern = await browser.storage.local.get("url_pattern");
});

browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    if (!changeInfo.url) return;
    console.log("tab updated", id, tab.url, changeInfo);
    if (!roottab) roottab = tab;
    if (roottab.id != tab.id && changeInfo.url.match(url_pattern)) {
        browser.tabs.remove([tab.id]);
        browser.tabs.update(roottab.id, {url: changeInfo.url});
    }
});
