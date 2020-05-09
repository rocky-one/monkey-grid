export const createCanvas = (attrs = {}) => {
    let canvas = document.createElement('canvas')
    Object.keys(attrs).forEach(k => {
        canvas[k] = attrs[k]
    })
    return canvas
}
/**
 * @desc 创建dom节点
 * @param {*} tag 
 * @param {object} attrs 属性
 */
export const createDom = (tag, attrs = {}) => {
    let dom = document.createElement(tag)
    Object.keys(attrs).forEach(k => {
        dom.setAttribute(k, attrs[k])
    })
    return dom
}

export const setDomCss = (dom, style) => {
    Object.keys(style).forEach(k => {
        dom.style[k] = style[k]
    })
}

export const setCanvasCss = (dom, style) => {
    Object.keys(style).forEach(k => {
        dom[k] = style[k]
    })
}

export const setDomAttr = (dom, attr) => {
    Object.keys(attr).forEach(k => {
        dom.setAttribute(k, attr[k])
    })
}