
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        
        chrome.tabs.executeScript(tabId, {
            code: `   
            
                setInterval(() => {
                
                    let el = document.querySelector('#root > div > section > div.page-inner-container > div > div.react-ripples > button');

                    if(el){
                        el.click()
                    }
                }, 5000);


            `
          });

    }
});
