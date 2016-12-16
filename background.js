var outputScript = '';
var isRecording = false;
var windowNum = 0;
//handle popup.js event
chrome.runtime.onMessage.addListener(
    /**
     *
     * @param request JSON
     *  command: 'manual-start', 'manual-finish', 'auto-start', 'auto-finish'
     *  cssSelector: to identify one element
     *  action: 'click' | 'focus' | 'setValue'
     *
     *
     * @param sender
     * @param sendResponse
     */
    function(request, sender, sendResponse)
    {
        switch(request.command) {
            case 'manual-start':
                break;
            case 'manual-finish':
                break;
            case 'auto-start':
                getHeaderScript();
                isRecording = true;
                windowNum = 1;
                sendResponse({msg: 'test record running'})
                break;
            case 'auto-finish':
                // notify to display generated script
                // and copy to clipboard
                isRecording = false;
                outputScript += getEndingScript();
                sendResponse({msg: outputScript})
                break;
            case 'get-status':
                sendResponse({isRecording: isRecording});
                break;
            default:
                break;
        }
    }
);

// Handle event sent from content.js
// Handling auto mode
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "content");

    /**
     *
     * @param msg JSON
     *  cssSelector, action, val
     *
     * click:
     * browser.expect.element('cssSelector').to.be.present;
     * browser.click('cssSelector');
     *
     * setValue:
     * browser.expect.element('cssSelector').to.be.present;
     * browser.setvalue('cssSelector', 'val');
     */
    port.onMessage.addListener(function(msg) {
        var cssSelector = msg.cssSelector;
        if(isRecording) {
            switch (msg.action) {
                case 'setValue':
                    outputScript += getExpect(cssSelector) + getSetValue(cssSelector, msg.val);
                    break;
                case 'click':
                    outputScript += getExpect(cssSelector) + getClick(cssSelector);
                    break;
                // case 'switchWindow':
                //     outputScript += getSwitchWindow();
                //     break;
                default:
                    break;
            }
        }
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    //... whatever other stuff you were doing anyway
    chrome.tabs.getSelected(null, function(tab) {
        // alert(tab.url);  //the URL you asked for in *THIS QUESTION*
        // tab changed, notify nightwatch to switch window

    });
});


/**
 * script generate related function
 */
function getHeaderScript() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        var url = tabs[0].url;
        var header='module.exports = {\'Test From: NightWatchScriptGenerator\':\n'+
            'function (browser) {\n' +
            'browser.url(\''+url+'\').waitForElementVisible(\'body\', 1000);\n';
        outputScript = header;
})
}

function getEndingScript() {
    return 'browser.pause(5000).end();\n' + '}\n};';
}
function getExpect(cssSelector) {
    return 'browser.expect.element(\''+cssSelector+'\').to.be.present.before(1000);\n';
}

function getSetValue(cssSelector, val) {
    return 'browser.setValue(\''+ cssSelector +'\', \''+ val +'\');\n';
}

function getClick(cssSelector) {
    return 'browser.click(\'' + cssSelector + '\');\n';
}



// function getSwitchWindow() {
//     windowNum++;
//     var script;
//
//         windowNum++;
//         var state1 = "var newWindow;\n";
//         var state2 = "this.verify.equal(result.value.length, " + windowNum + ", ' There should be " + windowNum + " windows open');\n";
//         var state3 = "newWindow = result.value[" + (windowNum-1) + "];\n";
//         var state4 = "this.switchWindow(newWindow);\n";
//         var functionBody = state1 + state2 + state3 + state4;
//
//     script= 'browser.windowHandles(function(result) \n{'+ functionBody + '}).pause(1000);\n';
//
//     return script;
// }