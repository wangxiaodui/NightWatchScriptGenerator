var outputScript = '';
var recordingStatus = {
    isRecordingAuto: false,
    isRecordingManual: false
}
// var isRecordingAuto = false;
// var isRecordingManual = false;
var windowNum = 0;
//handle popup.js event
chrome.runtime.onMessage.addListener(
    /**
     *
     * @param request JSON
     *  command: 'manual-start', 'manual-finish', 'manual-step', 'auto-start', 'auto-finish'
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
                startRecord(false, true);
                sendResponse({msg: 'test record running'})
                break;
            case 'manual-step':
                var data = request.data;
                outputScript += getManualStep(data);
                sendResponse({msg: outputScript});
                break;
            case 'manual-finish':
                endRecord();
                sendResponse({msg: outputScript});
                break;
            case 'auto-start':
                startRecord(true, false);
                sendResponse({msg: 'test record running'})
                break;
            case 'auto-finish':
                // notify to display generated script
                // and copy to clipboard
                endRecord();
                sendResponse({msg: outputScript})
                break;
            case 'get-status':
                sendResponse({recordingStatus: recordingStatus});
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
        if(recordingStatus.isRecordingAuto) {
            switch (msg.action) {
                case 'setValue':
                    outputScript += getExpect(cssSelector) + getSetValue(cssSelector, msg.val);
                    break;
                case 'click':
                    outputScript += getExpect(cssSelector) + getClick(cssSelector);
                    break;
                default:
                    break;
            }
        }
        if(recordingStatus.isRecordingManual) {

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
    return 'browser.expect.element(\''+ cssSelector +'\').to.be.present.before(1000);\n';
}

function getSetValue(cssSelector, val) {
    return 'browser.setValue(\''+ cssSelector +'\', \''+ val +'\');\n';
}

function getClick(cssSelector) {
    var result = 'browser.click(\'' + cssSelector + '\');\n';
    if (cssSelector.indexOf('[target=_blank]') != -1) {
        result += getSwitchWindow();
    }
    return result;
}


function getSwitchWindow() {
    windowNum++;
    var script;

        windowNum++;
        var state1 = 'var newWindow;\n';
        var state2 = 'this.verify.equal(result.value.length, ' + windowNum + ',  There should be ' + windowNum + ' windows open);\n';
        var state3 = 'newWindow = result.value[' + (windowNum-1) + '];\n';
        var state4 = 'this.switchWindow(newWindow);\n';
        var functionBody = state1 + state2 + state3 + state4;

    script= 'browser.windowHandles(function(result) \n{'+ functionBody + '}).pause(1000);\n';

    return script;
}


/**
 * generate action & expect statement
 * check out nightwatch api for more
 *
 * action format
 * browser.element('cssSelector').
 * expect possible format:
 *
 * 0.browser.expect.element('cssSelector').to.(not.)be.present.before(1000);
 *
 *
 * 1.browser.expect.element('cssSelector').text.
 *  to.contain
 *  to.not.contain
 *  to.equal
 *  to.not.equal
 *
 * 2.browser.expect.element('cssSelector').to.have.value.
 *  which.equals('someValue')
 *  which.not.equals('someValue')
 *  which.contains('someValue')
 *  which.not.contains('someValue')
 *
 * 3.browser.expect.element('cssSelector').to.(not).have.css('cssProperty').
 *  which.equals('somevalue')
 *  which.not.equals('someValue')
 *  which.contains('someValue')
 *  which.not.contains('someValue')
 *
 *  4.browser.expect.element('cssSelector').to.have.attribute('someAttribute').
 *  which.equals('someValue')
 *  which.not.equals('someValue')
 *  which.contains('someValue')
 *  which.not.contains('someValue')
 *
 *
 * @param data
 */
function getManualStep(data) {
    var action;
    var expect = '';
    switch (data.targetAction) {
        case 0: // set value
            action = getSetValue(data.targetCssSelector, data.targetValue);
            break;
        case 1: // click
            action = getClick(data.targetCssSelector);
            break;
    }
    // if(data.isUsingExpectation) {
    //     switch (data.expectPresent) {
    //         case 0:
    //             expect = 'browser.expect.element(' +data.expectCssSelector + ').to.be.present.before(1000);\n'
    //             break;
    //         case 1:
    //             expect = 'browser.expect.element(' +data.expectCssSelector + ').not.to.be.present.before(1000);\n'
    //             break;
    //     }
    //     if(data.isUsingExpectProperty) {
    //         switch (data.expectProperty) {
    //             case 0 || 1: // attribute, css
    //                 expect += getHaveProperty(data);
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }
    //     if(data.isUsingExpectEquation) {
    //         expect += getEquation(data);
    //     }
    //
    // } else {
    //     expect = '';
    // }
    return action + expect;
}

function getHaveProperty(data) {
    var property;
    switch (data.expectProperty) {
        case 0:
            property = 'attribute(' + data.expectPropertyValue + ')';
            break;
        case 1:
            property = 'css(' + data.expectPropertyValue + ')';
            break;
        default:
            break;
    }
    return 'browser.expect.element(' + data.expectCssSelector + ').to.' + (data.expectPropertyHave == 0 ? 'have' : 'not.have.')
    + property + ';\n';
}

function getEquation(data) {
    var result = 'browser.expect.element(' +data.expectCssSelector + ').';
    switch (data.expectProperty) {
        case 0 || 1:
            result += 'to.have.' + data.expectProperty == 0 ? 'attribute' : 'css'
            + '(' + data.expectPropertyValue + ').which.';
            break;
        case 2:
            result += 'to.have.value.which.';
            break;
        case 3:
            result += 'text.to.';
            break;
        default:
            break;
    }
    var equation = '';
    switch (data.expectEquation) {
        case 0: // equals
            equation = (data.expectProperty == 3 ? 'equal' : 'equals');
            break;
        case 1: // contains
            equation = (data.expectProperty == 3 ? 'contain' : 'contains');
            break;
        case 2:  // not equals
            equation = (data.expectProperty == 3 ? 'not.equal' : 'not.equals');
            break;
        case 3: // not contains
            equation = (data.expectProperty == 3 ? 'not.contain' : 'not.contains');
            break;
        default:
            break;
    }
    result += equation + '(' + data.expectEquationValue + ');\n';
    return result;
}
/**
 * end of script generate related functions
 */



function startRecord(auto, manual) {
    windowNum = 1;
    getHeaderScript();
    recordingStatus.isRecordingAuto = auto;
    recordingStatus.isRecordingManual = manual;
}

function endRecord() {
    recordingStatus.isRecordingAuto = false;
    recordingStatus.isRecordingManual = false;
    outputScript += getEndingScript();
}

