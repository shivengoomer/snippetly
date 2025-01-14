chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ snippets: [] });
    console.log('Snippetly installed and initialized!');
  });
  