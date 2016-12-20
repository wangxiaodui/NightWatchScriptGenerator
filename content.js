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
    //     port.postMessage({action: 'switchWindow'});
}

function genCssSelector(ele, self) {
    // return  {
    //     ele: ele,
    //     id: self.attr('id') ? self.attr('id') : '',
    //     cls: self.attr('class') ?  self.attr('class') : '',
    //     type: self.attr('type') ? self.attr('type') : '',
    //     href: self.attr('href') ? self.attr('href') : '',
    //     target: self.attr('target') == '_blank' ? '_blank' : ''
    // }
    var id = self.attr('id') != undefined ? '[id=\"' + self.attr('id') + '\"]' : '';
    // var cls = self.attr('class') != undefined ? '[class=' + self.attr('class').replace(' ', ',') + ']' : '';
    var cls = self.attr('class') != undefined ? '.' + self.attr('class').split(' ')[0] : '';
    // cls = '.' + cls.split('.')[1];
    var type = self.attr('type') != undefined ? '[type=\"' + self.attr('type') + '\"]' : '';
    var href = self.attr('href') != undefined ? '[href=\"' + self.attr('href') + '\"]' : '';
    var target = self.attr('target') != undefined ? '[target=\"' + self.attr('target') + '\"]' : '';
    return ele + cls + id + type + href + target;
    // return ele + id + type + href + target;

}

// function targetBlank(self) {
//     return (self.attr('target') == '_blank');
// }
//
