
/**
 * @desc 创建dom节点
 * @param {*} tag 
 * @param {*} id 
 * @param {*} className 
 * @param {*} styles 
 */
export const createDom = (tag, id, className, styles = {}, attr = {}) => {
    let dom = document.createElement(tag)
    id && (dom.id = id)
    className && (dom.className = className)
    setDomCss(dom, styles)
    setDomAttr(dom, attr)
    return dom
}

export const setDomCss = (dom, style) => {
    Object.keys(style).forEach(k => {
        dom.style[k] = style[k]
    })
}

export const setDomAttr = (dom, attr) => {
    Object.keys(attr).forEach(k => {
        dom.setAttribute(k, attr[k])
    })
}

export const getScrollBarPx = (elePx, contPx) => {
    let p = elePx / contPx,
        px = p * elePx
    if (px < 20) {
        px = 20
    }
    return {
        px,
        percentage: p,
        surplusPx: elePx - px
    }
}

/**
 * @desc 计算纵向滚动条滑块大小
 * @param {*} container 
 * @param {*} scrollBarContainer 
 */
export function calcVerticalSliderSize(container, scrollBarContainer) {
    // 计算方式 可视区域高/内容高 = 滚动条区域高/滚动条内容总高
    // scrollBarContainer.clientHeight是创建scrollBarContainer是容器的高度，这个高度可以和container容器一样高，也可以自定义，公式是成立的
    // container.clientHeight / container.scrollHeight = bar.height / scrollBarContainer.clientHeight
    // container.clientHeight / container.scrollHeight = x / scrollBarContainer.clientHeight  //求x的值
    // x = container.clientHeight * scrollBarContainer.clientHeight / container.scrollHeight
    const barContainerClientHei = scrollBarContainer.clientHeight
    let height = container.clientHeight * barContainerClientHei / container.scrollHeight
    if(height < 20) {
        height = 20
    }
    return {
        height,
        surplusHeight: barContainerClientHei - height
    }
}
/**
 * @desc 计算纵向slider位置
 * @param {*} container 
 * @param {*} scrollBarContainer 
 * @param {*} slider 
 * @param {*} scrollTop 
 */
export function calcVerticalSliderTop(container, scrollBarContainer, slider, scrollTop = 0) {
    const canScrollTopPx = container.scrollHeight - container.clientHeight
    const scrollPercentage = scrollTop / canScrollTopPx
    const canScrollBarPx = scrollBarContainer.clientHeight - slider.clientHeight
    const top = canScrollBarPx * scrollPercentage
    return top
}
/**
 * @desc 计算横行滚动条滑块大小
 * @param {*} container 
 * @param {*} scrollBarContainer 
 */
export function calcHorizontalSliderSize(container, scrollBarContainer) {
    const barContainerClientWid = scrollBarContainer.clientWidth
    let width = container.clientWidth * barContainerClientWid / container.scrollWidth
    if(width < 20) {
        width = 20
    }
    return {
        width,
        surplusWidth: barContainerClientWid - width
    }
}
/**
 * @desc 计算横行滚动条slider位置
 * @param {*} container 
 * @param {*} scrollBarContainer 
 * @param {*} slider 
 * @param {*} scrollLeft 
 */
export function calcHorizontalSliderLeft(container, scrollBarContainer, slider, scrollLeft = 0) {
    const canScrollLeftPx = container.scrollWidth - container.clientWidth
    const scrollPercentage = scrollLeft / canScrollLeftPx
    const canScrollBarPx = scrollBarContainer.clientWidth - slider.clientWidth
    const left = canScrollBarPx * scrollPercentage
    return left
}