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
        toggleDisplay( $('.manual-menu'));

    })

    $('#use-expectation').on('click', function() {
        var ele = $('.expectation-form');
        toggleDisplay(ele);
        if($(this).text() == 'Use')
            $(this).text('Close')
        else
            $(this).text('Use')
    })

    $('#step-finish').on('click', function() {
        var isUsingExpectation = ($('.expectation-form').css('display') === 'inherit');
        var targetCssSelector = $('#target-css-selector').val();
        var expectCssSelector = $('#expect-css-selector').val();
        var expectPropertyValue = $('#expect-property-value');

        if(isManualMenuFormValid(isUsingExpectation, targetCssSelector, expectCssSelector, expectPropertyValue)) {
            var msg = {
                command: 'manual-step',
                data: {
                    isUsingExpectation: isUsingExpectation,
                    isUsingExpectProperty: $('#expect-property-wrap').css('display') != 'none',
                    isUsingExpectEquation: $('#expect-equation-wrap').css('display') != 'none',
                    targetCssSelector: targetCssSelector,
                    targetValue: $('#target-value').val(),
                    expectCssSelector: expectCssSelector,
                    expectPropertyValue: expectPropertyValue,
                    expectEquationValue: $('#expect-equation-value').val(),
                    targetAction: $('#target-action').get(0).selectedIndex,
                    expectPresent: $('#expect-present').get(0).selectedIndex,
                    expectPropertyHave: $('#expect-property-have').get(0).selectedIndex,
                    expectProperty: $('#expect-property').get(0).selectedIndex,
                    expectEquation: $('#expect-equation').get(0).selectedIndex
                }
            }

            // $('#note').text('All right, next move').css('display', 'inherit');

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

    $('#expect-property-use').on('click', function() {
        if($(this).text() == 'Don\'t use') {
            $(this).text('Use');
            $('#expect-property-wrap').css('display', 'none');
        } else {
            $(this).text('Don\'t use');
            $('#expect-property-wrap').css('display', 'inherit');
        }

    })

    $('#expect-equation-use').on('click', function() {
        if($(this).text() == 'Don\'t use') {
            $(this).text('Use');
            $('#expect-equation-wrap').css('display', 'none');
        } else {
            $(this).text('Don\'t use');
            $('#expect-equation-wrap').css('display', 'inherit');
        }
    })

    $('#target-action').on('change', function() {
        if($(this).get(0).selectedIndex == 1) {
            // select click
            $('#target-value').css('display', 'none');
        } else {
            // select input
            $('#target-value').css('display', 'inherit');
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
            toggleDisplay( $('.manual-menu'));
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


function toggleDisplay(ele, text) {
    if(ele.css('display') == 'none')
        ele.css('display', 'inherit');
    else
        ele.css('display', 'none');
    if(text)
        ele.text(text);
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

function isManualMenuFormValid(isUsingExpectation, targetCssSelector, expectCssSelector, expectPropertyValue) {
    if(!isUsingExpectation) {
        if(targetCssSelector != '')
            return true;
    } else { // using expectation
        if(targetCssSelector != '' && expectCssSelector != '' && expectPropertyValue != '')
            return true;
    }
    return false;
}