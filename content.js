function createTooltip() {
    if (document.getElementById('result')) {
        document.getElementById('result').remove();
    }
    if (document.getElementById('tooltip-title')) {
        document.getElementById('tooltip-title').remove();
    }
    if (document.getElementById('tooltip-text')) {
        document.getElementById('tooltip-text').remove();
    }

    const tooltip = document.createElement('div');
    tooltip.id = 'result';
    tooltip.className = 'custom-tooltip';
    tooltip.style.display = 'none';  // Start with tooltip hidden

    const titleContainer = document.createElement('h4');
    titleContainer.id = 'tooltip-title'
    titleContainer.style.display = 'none';  // Start with tooltip hidden
    tooltip.appendChild(titleContainer);

    // Create a container for the text to avoid overwriting the button
    const textContainer = document.createElement('div');
    textContainer.id = 'tooltip-text';
    tooltip.appendChild(textContainer);

    const arrow = document.createElement('div');
    arrow.className = 'tooltip-arrow';
    tooltip.appendChild(arrow);

    document.body.appendChild(tooltip);

    return {
        tooltip: tooltip,
        titleContainer: titleContainer,
        textContainer: textContainer
    };
}

function createCloseButton(tooltip) {
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'close-button';
    // closeButton.style.cssText = 'position: absolute; top: 0; right: 0; border: none; background: none; cursor: pointer; outline: none; padding: 0 5px; font-size: 16px;';
    closeButton.onclick = function () {
        tooltip.remove(); // Remove the tooltip from the DOM
    };
    tooltip.appendChild(closeButton);
}

function showTooltip(tooltip, rect) {
    // Center the tooltip horizontally and position it above the selected area
    // tooltip.style.left = `${rect.left + window.pageXOffset + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.left = `${rect.left + window.pageXOffset }px`;
    tooltip.style.top = `${rect.bottom + window.pageYOffset - tooltip.offsetHeight + 10}px`; // Adjust to position correctly
    tooltip.style.display = 'block'; // Make sure the tooltip is shown
}

function createSearchButtons(tooltip, searchText) {
    const sites = [
        { name: 'Google', icon: 'icons/google-icon.webp' },
        { name: 'Wikipedia', icon: 'icons/wikipedia-icon.png' },
        { name: 'YouTube', icon: 'icons/youtube-icon.png' },
    ];
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'container-search-button';

    sites.forEach(site => {
        const button = document.createElement('button');
        button.className = 'search-button';

        // Create an image element for the icon
        const icon = document.createElement('img');
        icon.src = chrome.runtime.getURL(site.icon); // Get correct URL for Chrome Extension resource
        icon.alt = `${site.name} icon`;
        icon.style.width = '20px'; // Set the image size
        icon.style.height = '20px';

        button.appendChild(icon); // Add the icon to the button
        // button.appendChild(document.createTextNode(site.name)); // Optional: Add text label

        button.onclick = function () {
            openSearchTab(site.name, searchText);
        };
        buttonDiv.appendChild(button);
    });

    tooltip.appendChild(buttonDiv);
}

function openSearchTab(site, searchText) {
    // const text = document.getElementById('tooltip-text').textContent;
    let url;
    switch (site) {
        case 'YouTube':
            url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchText)}`;
            break;
        case 'Google':
            url = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
            break;
        case 'Wikipedia':
            url = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(searchText)}`;
            break;
    }
    if (url) {
        window.open(url, '_blank');
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log(message.text);

    const { tooltip, titleContainer, textContainer } = createTooltip();

    // Update tooltip text and show 'Loading...'
    textContainer.textContent = 'Loading...'; 

    // Position and then fetch data
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        console.log("rect: ", rect)

        showTooltip(tooltip, rect); // Position and show tooltip
        fetchLLaMA3Inference(message.text, tooltip, titleContainer, textContainer); // Pass tooltip to update on fetch complete
    }
});

function fetchLLaMA3Inference(prompt, tooltip, titleContainer, textContainer) {
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    const apiKey = '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';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [
                {
                    "role": "system",
                    "content": "Explain the following term in short. Use markdown for formatting."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
    })
        .then(response => response.json())
        .then(data => {
            const result = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
            titleContainer.style.display = 'block';
            titleContainer.textContent = 'What is ' + "'" + prompt + "'?";
            const htmlContent = marked.parse(result);  // Convert Markdown to HTML
            textContainer.innerHTML = htmlContent;  // Set the HTML content
            // textContainer.textContent = result || 'No result found';
            tooltip.classList.add('show');
            createCloseButton(tooltip);
            createSearchButtons(tooltip, prompt);
        })
        .catch(error => {
            tooltip.textContent = `Error: ${error.message}`;
            tooltip.classList.add('show');
        });
}
