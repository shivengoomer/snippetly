document.addEventListener('DOMContentLoaded', () => {
    const copyTabButton = document.getElementById('copy-tab');
    const viewSnippetsButton = document.getElementById('view-snippets');
    const viewClipboardButton = document.getElementById('view-clipboard');
    const status = document.getElementById('status');
    const mainPage = document.getElementById('main-page');
    const snippetsPage = document.getElementById('snippets-page');
    const clipboardPage = document.getElementById('clipboard-page');
    const snippetsList = document.getElementById('snippets-list');
    const clipboardList = document.getElementById('clipboard-list');
    const backButton = document.getElementById('back-button');
    const clipboardBackButton = document.getElementById('clipboard-back-button');
    const saveClipboardButton = document.getElementById('save-clipboard');
    const clipboardInput = document.getElementById('clipboard-input');
    const clearAllClipboardButton = document.getElementById('clear-all-clipboard');

    // Save the current tab and prompt for a title
    copyTabButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const currentTab = tabs[0];
                const defaultTitle = currentTab.title;
               

                const customTitle = prompt('Enter a title for this snippet:', defaultTitle);

                if (customTitle !== null) { // User did not cancel the prompt
                    const snippet = {
                        title: customTitle || defaultTitle,
                        url: currentTab.url,
                        type: 'link',
                    };

                    chrome.storage.local.get({ snippets: [] }, (data) => {
                        const snippets = data.snippets;
                        snippets.push(snippet);
                        chrome.storage.local.set({ snippets }, () => {
                            status.textContent = 'Tab saved to Snippetly!';
                            setTimeout(() => (status.textContent = ''), 3000);
                        });
                    });
                }
            }
        });
    });

    // View all saved snippets inside the extension
    viewSnippetsButton.addEventListener('click', () => {
        chrome.storage.local.get({ snippets: [] }, (data) => {
            const snippets = data.snippets;

            // Clear previous list
            snippetsList.innerHTML = '';

            if (snippets.length === 0) {
                const noSnippets = document.createElement('p');
                noSnippets.textContent = 'No snippets saved yet!';
                snippetsList.appendChild(noSnippets);
            } else {
                snippets.forEach((snippet, index) => {
                    const snippetItem = document.createElement('div');
                    snippetItem.classList.add('snippet-item');

                    const title = document.createElement('p');
                    title.textContent = `${index + 1}. ${snippet.title}`;

                    const url = document.createElement('a');
                    url.href = snippet.url;
                    url.textContent = snippet.url;
                    url.target = '_blank';

                    const copyButton = document.createElement('button');
                    copyButton.textContent = 'Copy URL';
                    copyButton.addEventListener('click', () => {
                        navigator.clipboard.writeText(snippet.url).then(() => {
                            status.textContent = 'URL copied to clipboard!';
                            setTimeout(() => (status.textContent = ''), 3000);
                        });
                    });

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Remove';
                    deleteButton.addEventListener('click', () => {
                        snippets.splice(index, 1);
                        chrome.storage.local.set({ snippets }, () => {
                            status.textContent = 'Snippet removed!';
                            setTimeout(() => (status.textContent = ''), 3000);
                            viewSnippetsButton.click(); // Refresh the list
                        });
                    });

                    snippetItem.appendChild(title);
                    snippetItem.appendChild(url);
                    snippetItem.appendChild(copyButton);
                    snippetItem.appendChild(deleteButton);
                    snippetsList.appendChild(snippetItem);
                });
            }

            mainPage.style.display = 'none';
            snippetsPage.style.display = 'block';
        });
    });

    // Back button to return to the main page from snippets
    backButton.addEventListener('click', () => {
        mainPage.style.display = 'block';
        snippetsPage.style.display = 'none';
    });

    // View clipboard history
    viewClipboardButton.addEventListener('click', () => {
        chrome.storage.local.get({ clipboard: [] }, (data) => {
            const clipboard = data.clipboard;

            // Clear previous list
            clipboardList.innerHTML = '';

            if (clipboard.length === 0) {
                const noClipboard = document.createElement('p');
                noClipboard.textContent = 'No clipboard history yet!';
                clipboardList.appendChild(noClipboard);
            } else {
                clipboard.forEach((item, index) => {
                    const clipboardItem = document.createElement('div');
                    clipboardItem.classList.add('clipboard-item');

                    const content = document.createElement('p');
                    content.textContent = `${index + 1}. ${item.content}`;


                    const copyButton = document.createElement('button');
                    copyButton.textContent = 'Copy';
                    copyButton.addEventListener('click', () => {
                        navigator.clipboard.writeText(item.content).then(() => {
                            status.textContent = 'Content copied to clipboard!';
                            setTimeout(() => (status.textContent = ''), 3000);
                        });
                    });

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Remove';
                    deleteButton.addEventListener('click', () => {
                        clipboard.splice(index, 1);
                        chrome.storage.local.set({ clipboard }, () => {
                            status.textContent = 'Clipboard item removed!';
                            setTimeout(() => (status.textContent = ''), 3000);
                            viewClipboardButton.click(); // Refresh the list
                        });
                    });

                    clipboardItem.appendChild(content);
                    clipboardItem.appendChild(copyButton);
                    clipboardItem.appendChild(deleteButton);
                    clipboardList.appendChild(clipboardItem);
                });
            }

            mainPage.style.display = 'none';
            clipboardPage.style.display = 'block';
        });
    });

    // Back button to return to the main page from clipboard
    clipboardBackButton.addEventListener('click', () => {
        mainPage.style.display = 'block';
        clipboardPage.style.display = 'none';
    });

    // Save text to clipboard history
    saveClipboardButton.addEventListener('click', () => {
        const clipboardContent = clipboardInput.value.trim();

        if (clipboardContent) {
            const clipboardItem = {
                content: clipboardContent,
            };

            chrome.storage.local.get({ clipboard: [] }, (data) => {
                const clipboard = data.clipboard;
                clipboard.push(clipboardItem);
                chrome.storage.local.set({ clipboard }, () => {
                    clipboardInput.value = ''; // Clear input field
                    status.textContent = 'Text saved to clipboard history!';
                    setTimeout(() => (status.textContent = ''), 3000);

                    // Dynamically add to the clipboard history list in the UI
                    const clipboardItemElement = document.createElement('div');
                    clipboardItemElement.classList.add('clipboard-item');

                    const content = document.createElement('p');
                    content.textContent = clipboardItem.content;

                    const copyButton = document.createElement('button');
                    copyButton.textContent = 'Copy';
                    copyButton.addEventListener('click', () => {
                        navigator.clipboard.writeText(clipboardItem.content).then(() => {
                            status.textContent = 'Content copied to clipboard!';
                            setTimeout(() => (status.textContent = ''), 3000);
                        });
                    });

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Remove';
                    deleteButton.addEventListener('click', () => {
                        const index = clipboard.indexOf(clipboardItem);
                        if (index > -1) {
                            clipboard.splice(index, 1);
                            chrome.storage.local.set({ clipboard }, () => {
                                status.textContent = 'Clipboard item removed!';
                                setTimeout(() => (status.textContent = ''), 3000);
                                clipboardItemElement.remove(); // Remove from UI
                            });
                        }
                    });

                    clipboardItemElement.appendChild(content);
                    clipboardItemElement.appendChild(copyButton);
                    clipboardItemElement.appendChild(deleteButton);
                    clipboardList.appendChild(clipboardItemElement);
                });
                clearAllClipboardButton.addEventListener('click', () => {
                    // Clear clipboard storage
                    chrome.storage.local.set({ clipboard: [] }, () => {
                        // Update UI
                        clipboardList.innerHTML = '';
                        status.textContent = 'All clipboard history cleared!';
                        setTimeout(() => (status.textContent = ''), 3000);
                    });
                });
            });
        }else {
            status.textContent = 'Please enter some text!';
            setTimeout(() => (status.textContent = ''), 3000);
        }
    });

    // Clear all clipboard history
    clearAllClipboardButton.addEventListener('click', () => {
        // Clear clipboard storage
        chrome.storage.local.set({ clipboard: [] }, () => {
            // Update UI
            clipboardList.innerHTML = '';
            status.textContent = 'All clipboard history cleared!';
            setTimeout(() => (status.textContent = ''), 3000);
        });
    });
});