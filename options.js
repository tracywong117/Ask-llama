import { defaultShortcuts, defaultPrompt1, defaultPrompt2 } from './config.js';

document.addEventListener('DOMContentLoaded', function () {
    // Load API Key
    const apiKeyInput = document.getElementById('apiKey');
    chrome.storage.local.get('askLlama_apiKey', function (result) {
        apiKeyInput.value = result['askLlama_apiKey'] || '';
    });
    
    // Save API Key
    const saveButton = document.getElementById('saveKey');
    saveButton.addEventListener('click', function () {
        const apiKey = apiKeyInput.value;
        if (apiKey) {
            chrome.storage.local.set({ 'askLlama_apiKey': apiKey }, function () {
                document.getElementById('modalText').innerText = "API Key saved successfully!";
                modal.style.display = "block";
            });
        } else {
            document.getElementById('modalText').innerText = "Please enter an API key.";
            modal.style.display = "block";
        }
    });
    
    const modal = document.getElementById('myModal');
    const closeModal = document.getElementsByClassName("close")[0];
    // Close the modal when clicked on close button
    closeModal.onclick = function () {
        modal.style.display = "none";
    };
    // Close the modal when clicked outside
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Load Shortcuts
    let shortcuts = [];
    chrome.storage.local.get(['askLlama_shortcut'], function (result) {
        shortcuts = result.shortcut || [...defaultShortcuts];
        renderTable();
    });

    // Render the shortcuts table
    const renderTable = () => {
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';

        shortcuts.forEach((shortcut, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" value="${shortcut.name}" class="shortcut-name"></td>
                <td><input type="text" value="${shortcut.url}" class="shortcut-url"></td>
                <td class="actions">
                    <button class="swap-up" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button class="swap-down" ${index === shortcuts.length - 1 ? 'disabled' : ''}>↓</button>
                    <button class="delete">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        const addRow = document.createElement('tr');
        addRow.innerHTML = `
            <td><input type="text" id="newShortcutName" placeholder="New Shortcut Name"></td>
            <td><input type="text" id="newShortcutUrl" placeholder="New Shortcut URL"></td>
            <td class="actions">
                <button id="addShortcut">Add</button>
            </td>
        `;
        tbody.appendChild(addRow);

        document.querySelectorAll('.swap-up').forEach((btn, idx) => {
            btn.addEventListener('click', () => {
                [shortcuts[idx], shortcuts[idx - 1]] = [shortcuts[idx - 1], shortcuts[idx]];
                renderTable();
            });
        });

        document.querySelectorAll('.swap-down').forEach((btn, idx) => {
            btn.addEventListener('click', () => {
                [shortcuts[idx], shortcuts[idx + 1]] = [shortcuts[idx + 1], shortcuts[idx]];
                renderTable();
            });
        });

        document.querySelectorAll('.delete').forEach((btn, idx) => {
            btn.addEventListener('click', () => {
                shortcuts.splice(idx, 1);
                renderTable();
            });
        });

        document.querySelectorAll('.shortcut-name').forEach((input, idx) => {
            input.addEventListener('input', (e) => {
                shortcuts[idx].name = e.target.value;
            });
        });

        document.querySelectorAll('.shortcut-url').forEach((input, idx) => {
            input.addEventListener('input', (e) => {
                shortcuts[idx].url = e.target.value;
            });
        });

        document.getElementById('addShortcut').addEventListener('click', () => {
            const name = document.getElementById('newShortcutName').value;
            const url = document.getElementById('newShortcutUrl').value;
            if (name && url) {
                shortcuts.push({ name, url });
                renderTable();
            }
        });
    };

    // Save Shortcuts
    const saveShortcutButton = document.getElementById('saveShortcut');
    saveShortcutButton.addEventListener('click', function () {
        chrome.storage.local.set({ 'askLlama_shortcut': shortcuts });
        document.getElementById('modalText').innerText = "Shortcut saved successfully!";
        modal.style.display = "block";
    });

    // Reset Shortcuts
    const resetShortcutButton = document.getElementById('resetShortcut');
    resetShortcutButton.addEventListener('click', function () {
        shortcuts = [...defaultShortcuts];
        renderTable();
        chrome.storage.local.set({ 'askLlama_shortcut': shortcuts });
    });

    // Load Background Color
    chrome.storage.local.get('askLlama-bgColor', function (result) {
        document.body.style.backgroundColor = result['askLlama-bgColor'] || '#f0f0f0';
    });

    // Change Background Color
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (event) => {
            const color = event.currentTarget.dataset.color;
            chrome.storage.local.set({ 'askLlama-bgColor': color });
            document.body.style.backgroundColor = color;
        });
    });

    // Load Prompts
    chrome.storage.local.get(['askLlama_promptPrefix', 'askLlama_promptSuffix'], function (result) {
        document.getElementById('prompt').value = result['askLlama_promptPrefix'] || defaultPrompt1;
        document.getElementById('prompt2').value = result['askLlama_promptSuffix'] || defaultPrompt2;
    });

    // Save Prompts
    document.getElementById('prompt').addEventListener('input', savePrompts);
    document.getElementById('prompt2').addEventListener('input', savePrompts);
    function savePrompts() {
        const prompt1 = document.getElementById('prompt').value;
        const prompt2 = document.getElementById('prompt2').value;

        chrome.storage.local.set({
            'askLlama_promptPrefix': prompt1,
            'askLlama_promptSuffix': prompt2
        });
    }

});