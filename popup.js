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
}

/**
 * update page view when opening
 */
function getStatus() {
    chrome.runtime.sendMessage({command: "get-status"}, function (response){
        // is recording
        if(response.msg) {
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