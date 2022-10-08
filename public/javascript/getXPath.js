export function getXPath(elm) {
    var allNodes = document.getElementsByTagName('*');
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
        if (elm.hasAttribute('id')) {
            var uniqueIdCount = 0;
            for (var n = 0; n < allNodes.length; n++) {
                if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
                if (uniqueIdCount > 1) break;
            };
            if (uniqueIdCount == 1) {
                segs.unshift(`*[@id='${elm.getAttribute('id')}']`);
                return '//' + segs.join('/');
            } else {
                segs.unshift(`*[@id='${elm.getAttribute('id')}' and local-name()='${elm.localName}']`);
            }
        } else if (elm.hasAttribute('class')) {
            segs.unshift(`*[@class='${elm.getAttribute('class')}' and local-name()='${elm.localName}']`);
        } else {
            let i, sib
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                if (sib.localName == elm.localName) i++;
            };
            segs.unshift(`*[local-name()='${elm.localName}']` + '[' + i + ']');
        };
    };
    return segs.length ? '/' + segs.join('/') : null;
}; 