// document.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('saveKey').addEventListener('click', function() {
//         const apiKey = document.getElementById('apiKey').value;
//         if (apiKey) {
//             chrome.storage.local.set({ 'apiKey': apiKey }, function() {
//                 alert('API Key saved successfully!');
//             });
//         } else {
//             alert('Please enter an API key.');
//         }
//     });
// });

// document.addEventListener('DOMContentLoaded', function() {
//     const saveButton = document.getElementById('saveKey');
//     const apiKeyInput = document.getElementById('apiKey');

//     saveButton.addEventListener('click', function() {
//         const apiKey = apiKeyInput.value;
//         if (apiKey) {
//             chrome.storage.local.set({ 'apiKey': apiKey }, function() {
//                 // createModal('API Key saved successfully!');
//                 chrome.scripting.executeScript({
//                     target: { tabId: tab.id },
//                     files: ['content.js']  // Ensure the content script is injected
//                 }, () => {
//                     // After the content script is injected, send a message to it
//                     chrome.tabs.sendMessage(tab.id, { text: "Saved" });
//                 });
//             });
//         } else {
//             // createModal('Please enter an API key.');
//             chrome.scripting.executeScript({
//                 target: { tabId: tab.id },
//                 files: ['content.js']  // Ensure the content script is injected
//             }, () => {
//                 // After the content script is injected, send a message to it
//                 chrome.tabs.sendMessage(tab.id, { text: "Enter" });
//             });
//         }
//     });
// });

document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveKey');
    const apiKeyInput = document.getElementById('apiKey');

    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value;
        // First, get the active tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];

            if (apiKey) {
                chrome.storage.local.set({ 'apiKey': apiKey }, function() {
                    // Execute the script in the active tab
                    chrome.scripting.executeScript({
                        target: { tabId: activeTab.id },
                        files: ['content.js']  // Ensure the content script is injected
                    }, () => {
                        // After the content script is injected, send a message to it
                        chrome.tabs.sendMessage(activeTab.id, { text: "Saved" });
                    });
                });
            } else {
                // Execute the script in the active tab
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    files: ['content.js']  // Ensure the content script is injected
                }, () => {
                    // After the content script is injected, send a message to it
                    chrome.tabs.sendMessage(activeTab.id, { text: "Enter" });
                });
            }
        });
    });
});