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
    afterClick('input', self);
})

$('button').click(function(e) {
    var self = $(this);
    afterClick('button', self);
})

$('a').click(function(e) {
    var self = $(this);
    afterClick('a', self);
})

function afterClick(ele, self) {
    var msg = {
        action: 'click',
        cssSelector: genCssSelector(ele, self)
    }
    port.postMessage(msg);
    // if(targetBlank())
    //     port.postMessage({action: 'switchWindow'})
}
function genCssSelector(ele, self) {
    var id = self.attr('id') ? '[id=' + self.attr('id') +']' : '';
    var cls = self.attr('class') ? '[class=' + self.attr('class') + ']': '';
    var type = self.attr('type') ? '[type=' + self.attr('type') +']' : '';
    var href = self.attr('href') ? '[href=' + self.attr('href') +']' : '';
    return ele + type + id + cls + href;
}

// function targetBlank(self) {
//     return (self.attr('target') == '_blank');
// }
//
