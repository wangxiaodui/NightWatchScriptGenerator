/**
 * How this works
 *
 * <In manual mode>
 *    Click manual, then use the manual menu to create every step
 *    by setting the target(using cssSelector) to perform some actions(setValue, click etc.)
 *    After each action, it can be examined by a expectation, to examine certain elements have certain value
 *
 * <In auto mode>
 *     Click auto, the extension will record user's action automatically
 *     DO NOT change tabs manually, but can open href with new target
 */


window.onload = function() {
    console.log('window loaded');

    getStatus();
    $('#auto').on('click', function() {
        clear('manual');
        var recording  = $(this).hasClass('btn-danger');
        if(!recording) {
            $('#script').text('');
            displayFinish($('#auto'));

            // start
            chrome.runtime.sendMessage({ command: "auto-start" }, function(res) {
            });
        } else {
            displayOrigin($('#auto'), 'Auto');
            // finish
            chrome.runtime.sendMessage({ command: "auto-finish" }, function(res) {
                // finished
                // display result script
                displayScript(res);
            });
        }

    })

    $('#manual').on('click', function() {
        clear('auto');
        var isManual  = $(this).hasClass('btn-danger');
        if(!isManual) {
            displayFinish($('#manual'));
            chrome.runtime.sendMessage({ command: "manual-start" })
        } else {
            displayOrigin($('#manual'), 'Manual');
            chrome.runtime.sendMessage({ command: "manual-finish" }, function(res) {
                // finished
                // display result script
                displayScript(res);
            });
        }
        checkManualMenu();

    })

    $('#use-expectation').on('click', function() {
        toggleExpectation();
    })

    $('#step-finish').on('click', function() {
        var isUsingExpectation = ($('.expectation-form').css('display') === 'inherit');
        var targetCssSelector = $('#target-css-selector').val();
        var expectCssSelector = $('#expect-css-selector').val();
        var expectValue = $('#expect-value').val();

        if(isManualMenuFormValid(isUsingExpectation, targetCssSelector, expectCssSelector)) {
            var msg = {
                command: 'manual-step',
                data: {
                    isUsingExpectation: isUsingExpectation,
                    targetCssSelector: targetCssSelector,
                    expectCssSelector: expectCssSelector,
                    expectValue: expectValue,
                    targetAction: $('#target-action').val(),
                    expectPhraseOne: $('#expect-phrase-one').val(),
                    expectPhraseTwo: $('#expect-phrase-two').val(),
                    expectPhraseThree: $('#expect-phrase-three').val()
                }
            }
            chrome.runtime.sendMessage(msg, function(res) {
                // finished
                // display result script
                $('#note').text('All right, next move').css('display', 'inherit').fadeOut(3000);
                displayScript(res);
            });
        } else {
            // check form
            $('#note').text('Please fill the form correctly').css('display', 'inherit').fadeOut(3000);
        }

    })
}

/**
 * update page view when opening
 */
function getStatus() {
    chrome.runtime.sendMessage({command: "get-status"}, function (response){
        // is recording auto
        if(response.recordingStatus.isRecordingAuto && !response.recordingStatus.isRecordingManual)
            displayFinish($('#auto'));
        else if(response.recordingStatus.isRecordingManual && !response.recordingStatus.isRecordingAuto) {
            displayFinish($('#manual'));
            checkManualMenu();
        }
    });
}

// change button color
function displayFinish(self) {
    self.text('Finish');
    self.removeClass('btn-success');
    self.addClass('btn-danger');
}

// change button color
function displayOrigin(self, text) {
    self.text(text);
    self.removeClass('btn-danger');
    self.addClass('btn-success');
}

function displayScript(res) {
    $('.script-display').css('display', 'inherit');
    $('#script').text(res.msg);
}

function hideScript() {
    $('.script-display').css('display', 'none');
}

function checkManualMenu() {
    var manualMenu = $('.manual-menu');

    if(manualMenu.css('display') == 'none')
        manualMenu.css('display', 'inherit');
    else
        manualMenu.css('display', 'none');

}
function toggleExpectation() {
    var expectationForm = $('.expectation-form');
    if(expectationForm.css('display') == 'none')
        expectationForm.css('display', 'inherit');
    else
        expectationForm.css('display', 'none');

}

function clear(which) {
    switch (which){
        case 'auto':
            displayOrigin($('#auto'), 'Auto');
            break;
        case 'manual':
            displayOrigin($('#manual'), 'Manual');
            $('.manual-menu').css('display', 'none');
            break;
        default:
            break;
    }
    hideScript();
}

function isManualMenuFormValid(isUsingExpectation, targetCssSelector, expectCssSelector) {
    if(!isUsingExpectation) {
        if(targetCssSelector != '')
            return true;
    } else { // using expectation
        if(targetCssSelector != '' && expectCssSelector != '')
            return true;
    }
    return false;
}