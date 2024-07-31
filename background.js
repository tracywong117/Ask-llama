chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "showTooltip",
        title: `Ask llama for "%s"`,
        contexts: ["selection"] // Show this menu item only when text is selected
    });
});

// Listen for clicks on the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "showTooltip") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']  // Ensure the content script is injected
        }, () => {
            // After the content script is injected, send a message to it
            chrome.tabs.sendMessage(tab.id, { text: info.selectionText });
        });
    }
});

chrome.action.onClicked.addListener(function (tab) {
    chrome.tabs.create({ 'url': chrome.runtime.getURL('options.html') });
});

chrome.commands.onCommand.addListener((command) => {
    console.log(`Command received: ${command}`);
});

