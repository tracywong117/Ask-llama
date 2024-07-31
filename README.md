# Ask Llama Chrome Extension

![](Screenshot.png)

Right click to ask Llama about the selected words. Supported by Groq and powered by Marked.js.

## Features

- **Context Menu Integration**: Right-click selected text to search it using Ask Llama.
- **Customizable Tooltips**: Tooltips show answers from a large language model (LLM) and allow further searches using predefined or custom shortcuts.
- **Search Engines**: Integrated with popular search engines like Google, Wikipedia, and YouTube. You can also customize and add your own shortcuts.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/ask-llama-extension.git
    ```
    Or Download ZIP.

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable "Developer mode" by toggling the switch in the top-right corner.

4. Click "Load unpacked" and select the directory where you cloned the repository.

## Usage

1. Select any text on a webpage.
2. Right-click the selected text.
3. Click on the context menu item that says `Ask llama for "<selected text>"`.

![](Screenshot1.png)

4. A tooltip will appear with an answer from the LLM and options to search the text using different engines or custom shortcuts.

![](Screenshot2.png)

## Configuration

To configure the extension, click on the extension icon in the toolbar and select "Options". 
![](Screenshot4.png)
Here you can:
- Set your Groq API key.
- Customize the search engines and their icons.
- Change the tooltip background color.
