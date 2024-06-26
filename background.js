chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "showTooltip",
        title: "What is '%s'?",
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

// // Listen for the command
// chrome.commands.onCommand.addListener((command) => {
//     if (command === "show_tooltip") {
//         console.log("Command: show_tooltip");
//         // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//         //     const tab = tabs[0];
//         //     chrome.scripting.executeScript({
//         //         target: { tabId: tab.id },
//         //         function: getSelectionText
//         //     }, (injectionResults) => {
//         //         for (const frameResult of injectionResults)
//         //             chrome.tabs.sendMessage(tab.id, { text: frameResult.result });
//         //     });
//         // });
//     }
// });

chrome.commands.onCommand.addListener((command) => {
    console.log(`Command received: ${command}`);
});

// // Helper function to get selected text
// function getSelectionText() {
//     const selection = window.getSelection();
//     return selection.toString();
// }