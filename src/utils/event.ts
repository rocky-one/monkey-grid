export function addEvent(ele, type, fn){
    if (ele.addEventListener){
        ele.addEventListener(type, fn);
    } else if(ele.attachEvent){
        ele.attachEvent('on'+type, fn);
    }
}

export function removeEvent(ele, type, fn){
    if (ele.addEventListener){
        ele.removeEventListener(type, fn);
    } else if(ele.attachEvent){
        ele.detachEvent('on'+type, fn);
    }
}