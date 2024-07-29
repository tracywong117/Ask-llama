document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveKey');
    const apiKeyInput = document.getElementById('apiKey');
    const modal = document.getElementById('myModal');
    const closeModal = document.getElementsByClassName("close")[0];

    saveButton.addEventListener('click', function () {
        const apiKey = apiKeyInput.value;
        if (apiKey) {
            chrome.storage.local.set({ 'apiKey': apiKey }, function () {
                document.getElementById('modalText').innerText = "API Key saved successfully!";
                modal.style.display = "block";
            });
        } else {
            document.getElementById('modalText').innerText = "Please enter an API key.";
            modal.style.display = "block";
        }
    });

    closeModal.onclick = function () {
        modal.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    const defaultShortcuts = [
        { name: 'Google', icon: 'icons/google-icon.webp', url: 'https://www.google.com/search?q=' },
        { name: 'Wikipedia', icon: 'icons/wikipedia-icon.png', url: 'https://en.wikipedia.org/wiki/Special:Search?search=' },
        { name: 'YouTube', icon: 'icons/youtube-icon.png', url: 'https://www.youtube.com/results?search_query=' },
    ];

    let shortcuts = [];

    chrome.storage.local.get(['shortcut'], function (result) {
        shortcuts = result.shortcut || Array.from(defaultShortcuts);
        renderTable();
    });

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


    const saveShortcutButton = document.getElementById('saveShortcut');

    saveShortcutButton.addEventListener('click', function () {
        chrome.storage.local.set({ 'shortcut': shortcuts });
    });

    const resetShortcutButton = document.getElementById('resetShortcut');

    resetShortcutButton.addEventListener('click', function () {
        shortcuts = [
            { name: 'Google', icon: 'icons/google-icon.webp', url: 'https://www.google.com/search?q=' },
            { name: 'Wikipedia', icon: 'icons/wikipedia-icon.png', url: 'https://en.wikipedia.org/wiki/Special:Search?search=' },
            { name: 'YouTube', icon: 'icons/youtube-icon.png', url: 'https://www.youtube.com/results?search_query=' },
        ];
        renderTable();
        chrome.storage.local.set({ 'shortcut': shortcuts });
    });

    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (event) => {
            const color = event.currentTarget.dataset.color;
            document.body.style.backgroundColor = color;
        });
    });
});