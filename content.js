var port = chrome.runtime.connect({ name: "content" });

/**
 * when input[type=text] blur, is finish of input
 * cssSelector include: id, class, type
 */
$('input[type=text]').blur(function (e) {
    // var tabHref = document.location.href;
    var cssSelector = genCssSelector('input', $(this));
    var msg = {
        action: 'setValue',
        cssSelector: cssSelector,
        val: $(this).val()
    };
    port.postMessage(msg);
});

$('input[type=submit]').click(function(e) {
    var self = $(this);
    afterClick(self);
})

$('button').click(function(e) {
    var self = $(this);
    afterClick(self);
})

function afterClick(self) {
    var msg = {
        action: 'click',
        cssSelector: genCssSelector('button', self)
    }
    port.postMessage(msg);
    if(targetBlank())
        port.postMessage({action: 'switchWindow'})
}
function genCssSelector(ele, self) {
    var id = self.attr('id') ? '[id=' + self.attr('id') +']' : '';
    var cls = self.attr('class') ? '[class=' + self.attr('class') + ']': '';
    var type = self.attr('type') ? '[type=' + self.attr('type') +']' : '';
    return ele + type + id + cls;
}

function targetBlank(self) {
    return (self.attr('target') == '_blank');
}

