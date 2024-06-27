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
    tooltip.style.left = `${rect.left + window.pageXOffset}px`;
    tooltip.style.top = `${rect.bottom + window.pageYOffset - tooltip.offsetHeight + 10}px`; // Adjust to position correctly
    tooltip.style.display = 'block'; // Make sure the tooltip is shown

    // const arrow = tooltip.querySelector('.custom-tooltip::after');
    const tooltipWidth = tooltip.offsetWidth;
    const arrowPosition = rect.width / 2;

    // Add a style to the tooltip for the arrow positioning
    tooltip.style.setProperty('--arrow-left', `${arrowPosition}px`);

    tooltip.classList.add('visible'); // This class controls the visibility of the arrow
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

        // showTooltip(tooltip, rect); // Position and show tooltip
        fetchLLaMA3Inference(message.text, tooltip, titleContainer, textContainer, rect); // Pass tooltip to update on fetch complete

        // Close the tooltip when clicking outside the tooltip
        document.addEventListener('click', function (event) {
            // console.log("Clicked")
            // Check if the click is outside the tooltip
            if (!tooltip.contains(event.target)) {
                // console.log("Outside tooltip")
                tooltip.remove();
            } else {
                // console.log("Inside tooltip")
            }
        }, { capture: true });
    }



});

// Not streaming
// function fetchLLaMA3Inference(prompt, tooltip, titleContainer, textContainer, rect) {
//     const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
//     const apiKey = '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';

//     fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${apiKey}`
//         },
//         body: JSON.stringify({
//             model: 'llama3-70b-8192',
//             messages: [
//                 {
//                     "role": "system",
//                     "content": "Explain the following term in short. Use markdown for formatting."
//                 },
//                 {
//                     "role": "user",
//                     "content": prompt
//                 }
//             ]
//         })
//     })
//         .then(response => response.json())
//         .then(data => {
//             showTooltip(tooltip, rect); // Position and show tooltip
//             const result = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
//             titleContainer.style.display = 'block';
//             titleContainer.textContent = 'What is ' + "'" + prompt + "'?";
//             const htmlContent = marked.parse(result);  // Convert Markdown to HTML
//             textContainer.innerHTML = htmlContent;  // Set the HTML content
//             // textContainer.textContent = result || 'No result found';
//             tooltip.classList.add('show');
//             createCloseButton(tooltip);
//             createSearchButtons(tooltip, prompt);
//         })
//         .catch(error => {
//             tooltip.textContent = `Error: ${error.message}`;
//             tooltip.classList.add('show');
//         });
// }

// Streaming
function fetchLLaMA3Inference(prompt, tooltip, titleContainer, textContainer, rect) {
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    let apiKey = '';
    chrome.storage.local.get('apiKey', function (data) {
        apiKey = data.apiKey;
        if (!apiKey) {
            // console.error('API Key is not set');
            showTooltip(tooltip, rect);  // Position and show tooltip
            titleContainer.style.display = 'block';
            titleContainer.textContent = 'What is ' + "'" + prompt + "'?";
            tooltip.classList.add('show');
            createCloseButton(tooltip);
            createSearchButtons(tooltip, prompt);
            textContainer.textContent = 'Please set your Groq API key in the extension options.';
            return;
        } else {
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
                    ],
                    "stream": true,
                })
            })
                .then(response => {
                    showTooltip(tooltip, rect);  // Position and show tooltip
                    titleContainer.style.display = 'block';
                    titleContainer.textContent = 'What is ' + "'" + prompt + "'?";
                    tooltip.classList.add('show');
                    createCloseButton(tooltip);
                    createSearchButtons(tooltip, prompt);

                    const reader = response.body.getReader();
                    let totalResult = '';
                    let notFinished = '';

                    // Extract json from data (streamed response)
                    function extractJsonFromData(data) {
                        const jsonList = [];
                        const lines = data.split('\n'); // Split the string into lines

                        for (let line of lines) {
                            line = line.trim(); // Trim whitespace
                            if (line === 'data: [DONE]') continue; // Skip the line with [DONE]
                            if (line.startsWith('data: ')) {
                                const jsonString = line.substring(6);
                                // console.log("Attempting to parse JSON:", jsonString); // Log the JSON string
                                try {
                                    const json = JSON.parse(jsonString);
                                    jsonList.push(json);
                                } catch (error) {
                                    // console.error("Error parsing JSON:", error);
                                    notFinished = "data: " + jsonString;
                                    // console.log("Not finished:", jsonString);
                                }
                            }
                        }

                        return jsonList;
                    }

                    // Process the json data and update the tooltip
                    function processText(jsonData) {
                        try {
                            const result = jsonData.choices &&
                                jsonData.choices[0] &&
                                jsonData.choices[0].delta &&
                                jsonData.choices[0].delta.content;

                            totalResult += result;

                            if (result) {

                                const htmlContent = marked.parse(totalResult);  // Convert Markdown to HTML
                                if (textContainer.textContent == 'Loading...') {
                                    textContainer.textContent = '';
                                }
                                textContainer.innerHTML = htmlContent;  // Set the HTML content

                            }
                        }
                        catch (error) {
                            // Handle parsing errors
                            console.log('Waiting for more data or parsing error:', error);
                        }
                    }

                    function push() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                console.log("Stream completed");
                                return;
                            }
                            let chunkText = new TextDecoder().decode(value);
                            if (notFinished) {
                                // console.log(chunkText);
                                chunkText = notFinished + chunkText;
                                notFinished = '';
                            }
                            extractJsonFromData(chunkText).forEach(processText);
                            push();
                        }).catch(error => {
                            tooltip.textContent = `Error reading stream: ${error.message}`;
                            tooltip.classList.add('show');
                        });
                    }

                    push();
                })
                .catch(error => {
                    tooltip.textContent = `Error: ${error.message}`;
                    tooltip.classList.add('show');
                });
        }
    });

}