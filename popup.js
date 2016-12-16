window.onload = function() {
    console.log('window loaded');

    getStatus();
    $('#record').on('click', function() {
        var recording  = $(this).hasClass('btn-danger');
        if(!recording) {
            $('#script').text('');
            displayStop();

            // start
            chrome.runtime.sendMessage({ command: "auto-start" }, function(res) {
                $('#note').text(res.msg);
            });
        } else {
            displayAuto();

            // finish
            chrome.runtime.sendMessage({ command: "auto-finish" }, function(res) {
                // finished
                // display result script
                $('#script').text(res.msg);
            });
        }

    })

    $('#manual').on('click', function() {
        if($('.manual-menu').css('display') == 'none')
            displayManualMenu();
        else
            hideManualMenu();
    })

    $('#use-expectation').on('click', function() {
        toggleExpectation();
    })
}

/**
 * update page view when opening
 */
function getStatus() {
    chrome.runtime.sendMessage({command: "get-status"}, function (response){
        // is recording
        if(response.isRecording) {
            displayStop();
        }
    });
}

function displayStop() {
    var record = $('#record');
    record.text('Stop');
    record.removeClass('btn-success');
    record.addClass('btn-danger');
}

function displayAuto() {
    var record = $('#record');
    record.text('Auto');
    record.removeClass('btn-danger');
    record.addClass('btn-success');
}


function displayManualMenu() {
    $('.manual-menu').css('display', 'inherit');
}

function hideManualMenu() {
    $('.manual-menu').css('display', 'none');
}

function toggleExpectation() {
    var expectationForm = $('.expectation-form');
    if(expectationForm.css('display') == 'none')
        expectationForm.css('display', 'inherit');
    else
        expectationForm.css('display', 'none');

}