document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveKey');
    const apiKeyInput = document.getElementById('apiKey');
    const modal = document.getElementById('myModal');
    const closeModal = document.getElementsByClassName("close")[0];

    saveButton.addEventListener('click', function () {
        const apiKey = apiKeyInput.value;
        if (apiKey) {
            chrome.storage.local.set({ 'apiKey': apiKey }, function() {
                document.getElementById('modalText').innerText = "API Key saved successfully!";
                modal.style.display = "block";
            });
        } else {
            document.getElementById('modalText').innerText = "Please enter an API key.";
            modal.style.display = "block";
        }
    });

    closeModal.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});