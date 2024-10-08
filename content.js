async function createTooltip() {
    if (document.getElementById('askLlama-shadow-host')) {
        document.getElementById('askLlama-shadow-host').remove();
    }

    const shadowHost = document.createElement('div');
    shadowHost.id = 'askLlama-shadow-host';
    document.body.appendChild(shadowHost);

    const shadow = shadowHost.attachShadow({ mode: 'open' });

    return fetch(chrome.runtime.getURL('tooltip.html'))
        .then(response => response.text())
        .then(html => {
            shadow.innerHTML = html;

            const tooltip = shadow.getElementById('result');
            const titleContainer = shadow.getElementById('tooltip-title');
            const textContainer = shadow.getElementById('tooltip-text');

            chrome.storage.local.get('askLlama-bgColor', (result) => {
                let color = result['askLlama-bgColor'] || 'aliceblue';
                tooltip.style.backgroundColor = color;
                tooltip.style.setProperty('--tooltip-arrow-color', color);
            });

            shadow.querySelector('.close-button').onclick = function () {
                shadowHost.remove();
            };

            return {
                shadow: shadow,
                tooltip: tooltip,
                titleContainer: titleContainer,
                textContainer: textContainer
            };
        });
}


function handleCloseButton(tooltip) {
    const closeButton = tooltip.querySelector('.close-button');
    closeButton.onclick = function () {
        tooltip.remove(); // Remove the tooltip from the DOM
    };
}

function showTooltip(tooltip, rect_left, rect_bottom, rect_width) {
    // Center the tooltip horizontally and position it above the selected area
    tooltip.style.left = `${rect_left + window.pageXOffset}px`;
    tooltip.style.top = `${rect_bottom + window.pageYOffset - tooltip.offsetHeight + 10}px`; // Adjust to position correctly
    tooltip.style.display = 'block'; // Make sure the tooltip is shown

    // const arrow = tooltip.querySelector('.custom-tooltip::after');
    const tooltipWidth = tooltip.offsetWidth;
    const arrowPosition = rect_width / 2;

    // Add a style to the tooltip for the arrow positioning
    tooltip.style.setProperty('--arrow-left', `${arrowPosition}px`);

    tooltip.classList.add('visible'); // This class controls the visibility of the arrow
}

function createSearchButtons(tooltip, searchText) {
    const defaultShortcuts = [
        { name: 'Google', icon: 'icons/google-icon.webp', url: 'https://www.google.com/search?q=' },
        { name: 'Wikipedia', icon: 'icons/wikipedia-icon.png', url: 'https://en.wikipedia.org/wiki/Special:Search?search=' },
        { name: 'YouTube', icon: 'icons/youtube-icon.png', url: 'https://www.youtube.com/results?search_query=' },
    ];

    let sites = [];

    chrome.storage.local.get(['askLlama_shortcut'], function (result) {
        sites = result.askLlama_shortcut || defaultShortcuts;

        const buttonDiv = tooltip.querySelector('.container-search-button');

        sites.forEach(site => {
            const button = document.createElement('button');
            button.className = 'search-button';

            if (site.icon) {
                // Create an image element for the icon
                const icon = document.createElement('img');
                icon.src = chrome.runtime.getURL(site.icon); // Get correct URL for Chrome Extension resource
                icon.alt = `${site.name} icon`;
                icon.style.width = '20px'; // Set the image size
                icon.style.height = '20px';

                button.appendChild(icon); // Add the icon to the button

                button.onclick = function () {
                    openSearchTab(site.name, searchText);
                };
                buttonDiv.appendChild(button);

            } else {
                const icon = document.createElement('span');
                icon.textContent = site.name.charAt(0);
                icon.className = 'custom-site-icon';

                button.appendChild(icon); // Add the icon to the button

                button.onclick = function () {
                    openSearchTab(site.name, searchText);
                };
                buttonDiv.appendChild(button);
            }
        });

        // tooltip.appendChild(buttonDiv);
    });

}

function openSearchTab(site, searchText) {
    let url;
    let shortcuts = [];
    chrome.storage.local.get(['askLlama_shortcut'], function (result) {
        shortcuts = result.askLlama_shortcut || defaultShortcuts;
        url = shortcuts.find(shortcut => shortcut.name === site)?.url + searchText;
        if (url) {
            window.open(url, '_blank');
        }
    });

}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let ref_rect_left = NaN;
    let ref_rect_bottom = NaN;
    if (document.getElementById('askLlama-shadow-host')) {
        const ref_shadowHost = document.getElementById('askLlama-shadow-host');
        const ref_tooltip = ref_shadowHost.shadowRoot.getElementById('result');
        ref_rect_left = parseFloat(ref_tooltip.style.left) - window.pageXOffset;
        ref_rect_bottom = parseFloat(ref_tooltip.style.top) - window.pageYOffset - 10;
    }

    createTooltip().then(({ shadow, tooltip, titleContainer, textContainer }) => {

        textContainer.textContent = 'Loading...';

        // Position and then fetch data
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            let rect_left = rect.left;
            let rect_bottom = rect.bottom;
            let rect_width = rect.width;

            if (rect_left === 0 && rect_bottom === 0) {
                console.log('No selection');
                if (ref_rect_left != NaN && ref_rect_bottom != NaN) {
                    rect_left = ref_rect_left;
                    rect_bottom = ref_rect_bottom;
                }
            }

            // showTooltip(tooltip, rect); // Position and show tooltip
            fetchLLaMA3Inference(message.text, tooltip, titleContainer, textContainer, rect_left, rect_bottom, rect_width); // Pass tooltip to update on fetch complete

            // Close the tooltip when clicking outside the tooltip
            document.addEventListener('click', function (event) {
                if (!shadow.host.contains(event.target)) {
                    shadow.host.remove();
                }
            }, { capture: true });
        }
    });


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
//             handleCloseButton(tooltip);
//             createSearchButtons(tooltip, prompt);
//         })
//         .catch(error => {
//             tooltip.textContent = `Error: ${error.message}`;
//             tooltip.classList.add('show');
//         });
// }

// Streaming
function fetchLLaMA3Inference(prompt, tooltip, titleContainer, textContainer, rect_left, rect_bottom, rect_width) {
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    let apiKey = '';
    chrome.storage.local.get(['askLlama_apiKey', 'askLlama_promptPrefix', 'askLlama_promptSuffix'], function (data) {
        apiKey = data.askLlama_apiKey;
        let promptPrefix = data.askLlama_promptPrefix || 'What is ';
        if (promptPrefix.trim().length > 0) {
            promptPrefix += ' ';
        }
        const promptSuffix = data.askLlama_promptSuffix || 'Explain in short.';

        if (!apiKey) {
            showTooltip(tooltip, rect_left, rect_bottom, rect_width);  // Position and show tooltip
            titleContainer.style.display = 'block';
            titleContainer.textContent = promptPrefix + prompt + "?";
            tooltip.classList.add('show');
            handleCloseButton(tooltip);
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
                            "role": "user",
                            "content": promptPrefix + prompt
                        },
                        {
                            "role": "system",
                            "content": promptSuffix
                        },
                    ],
                    "stream": true,
                })
            })
                .then(response => {
                    showTooltip(tooltip, rect_left, rect_bottom, rect_width);  // Position and show tooltip
                    titleContainer.style.display = 'block';
                    titleContainer.textContent = promptPrefix + prompt + "?";
                    tooltip.classList.add('show');
                    handleCloseButton(tooltip);
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
                                try {
                                    const htmlContent = marked.parse(totalResult);  // Convert Markdown to HTML
                                    if (textContainer.textContent == 'Loading...') {
                                        textContainer.textContent = '';
                                    }
                                    textContainer.innerHTML = htmlContent;  // Set the HTML content

                                }
                                catch (error) {
                                    console.log("Error parsing markdown:", error);
                                    textContainer.textContent = totalResult;
                                }

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
                    textContainer.textContent = `Error: ${error.message}`;
                    tooltip.classList.add('show');
                });
        }
    });

}