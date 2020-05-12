export function addEvent(ele, type){
    if(ele.addEventListener){
        ele.addEventListener(type,fun)
    }else if(ele.attachEvent){
        ele.attachEvent("on"+type,fun)
    }
}

export function removeEvent(ele, type){
    if(ele.addEventListener){
        ele.removeEventListener(type,fun)
    }else if(ele.attachEvent){
        ele.detachEvent("on"+type,fun)
    }
}