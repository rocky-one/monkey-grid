import {
    createDom,
    getScrollBarPx,
} from '../utils'
import { SCROLL_SIZE } from '../tableConst'
import './scrollBar.less'
// ele: this.container,
// direction: vertical,
// containerHeight: this.tableBodyHeight,
// contentHeight: this.tableHeight,
/**
 *  原生滚动条局限性 鼠标必须在滚动条区域内才能触发滚动事件 且 区域必须得到事件的焦点
 */
class ScrollBar {
    constructor(option) {
        this.setOption(option)
        this.init()
        // 滚动条未绑定mousemove mouseup 事件 此处使用table中的mouse事件
        // EventEmitter.on('mousemove', this.handleMouseMove)
        // EventEmitter.on('mouseup', this.handleMouseUp)
        document.body.addEventListener('mousemove', this.handleMouseMove)
        document.body.addEventListener('mouseup', this.handleMouseUp)
    }
    setOption = (option) => {
        Object.keys(option).forEach(k => {
            this[k] = option[k]
        })
    }
    init = () => {
        this.initScrollTop()
        this.initScrollLeft()
        this.isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1
        this.verticalScrollInfo = {
            height: 0,
            percentage: 1
        }
        this.createScroll()
        this.bindWheelEvent()
        this.initShow()
    }
    initScrollTop = () => {
        let maxScrollTop = this.vertical.contentPx - this.vertical.containerPx
        this.maxScrollTop = maxScrollTop > 0 ? maxScrollTop : 0
        this.scrollTop = 0
        this.scrollBarTop = 0
        this.scrollIngBarTop = 0
        this.vDistance = 0
        this.moveScrollTop = 0
    }
    initScrollLeft = () => {
        let maxScrollLeft = this.horizontal.contentPx - this.horizontal.containerPx
        this.maxScrollLeft = maxScrollLeft > 0 ? maxScrollLeft : 0
        this.scrollLeft = 0
        this.scrollBarLeft = 0
        this.scrollIngBarLeft = 0
        this.hDistance = 0
        this.moveScrollLeft = 0
    }
    createScroll = () => {
        const direction = this.direction
        direction.forEach(val => {
            const ele = this[`${val}Scroll`]()
            this.eventBind(ele, val)
        })

    }
    eventBind = (ele, val) => {
        if (!ele) return

        ele.addEventListener('mousedown', this[`${val}Down`])
        // ele.addEventListener('mouseup', this[`${val}Up`])
    }
    initShow = () => {
        if (this.maxScrollLeft === 0) {
            this.horizontalScrollBox.style.display = 'none'
        } else {
            this.horizontalScrollBox.style.display = 'block'
        }
        if (this.maxScrollTop === 0) {
            this.verticalScrollBox.style.display = 'none'
        } else {
            this.verticalScrollBox.style.display = 'block'
        }
    }
    // 是否有横向滚动条
    hasHScroll = () => {
        return this.maxScrollLeft > 0
    }
    // 是否有纵向滚动条
    hasVScroll = () => {
        return this.maxScrollTop > 0
    }
    // 获取横向滚动条大小
    getHScrollSize = () => {
        if (this.hasHScroll()) {
            return SCROLL_SIZE
        }
        return 0
    }
    // 获取纵向滚动条大小
    getVScrollSize = () => {
        if (this.hasVScroll()) {
            return SCROLL_SIZE
        }
        return 0
    }
    verticalScroll = () => {
        const maxScrollTop = this.maxScrollTop
        //if (maxScrollTop === 0) return
        let oldBox = document.getElementById('verticalScrollBox')
        if (oldBox && this.ele.contains(oldBox)) {
            this.ele.removeChild(oldBox)
            this.verticalScrollBox = oldBox = null
        }
        // this.verticalScrollOuter = createDom('div', 'verticalScrollOuter', 'vertical-scroll-outer', {
        //     position: 'absolute',
        //     right: 0,
        //     top: 0,
        //     width: `${this.vertical.width}px`,
        //     height: `${this.vertical.height}px`,
        //     overflow: 'hidden',
        // })

        this.verticalScrollInfo = getScrollBarPx(this.vertical.containerPx, this.vertical.contentPx)
        this.verticalScrollBox = createDom('div', 'verticalScrollBox', 'vertical-scroll-box', {
            position: 'absolute',
            right: 0,
            width: `${this.vertical.width}px`,
            borderRadius: '10px',
            height: `${this.vertical.containerPx}px`,
            overflow: 'hidden',
            zIndex: 9,
            ...(this.vertical.style || {})
        })
        this.verticalScrollBar = createDom('div', 'verticalScrollBar', 'right-scroll-bar', {
            position: 'absolute',
            top: 0,
            left: '2px',
            width: `${this.vertical.width - 6}px`,
            height: `${this.verticalScrollInfo.px}px`,
            borderRadius: '5px',
        })
        this.verticalScrollSpeed = this.verticalScrollInfo.percentage
        this.verticalScrollBox.appendChild(this.verticalScrollBar)
        // this.verticalScrollOuter.appendChild(this.verticalScrollBox)
        this.ele.appendChild(this.verticalScrollBox)
        this.verticalScrollBarRect = this.verticalScrollBar.getBoundingClientRect()
        return this.verticalScrollBar
    }
    horizontalScroll = () => {
        const maxScrollLeft = this.maxScrollLeft
        //if (maxScrollLeft === 0) return
        let oldBox = document.getElementById('horizontalScrollBox')
        if (oldBox && this.ele.contains(oldBox)) {
            this.ele.removeChild(oldBox)
            this.horizontalScrollBox = oldBox = null
        }
        this.horizontalScrollInfo = getScrollBarPx(this.horizontal.containerPx, this.horizontal.contentPx)
        this.horizontalScrollBox = createDom('div', 'horizontalScrollBox', 'horizontal-scroll-box', {
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: `${this.horizontal.containerPx}px`,
            borderRadius: '10px',
            height: `${this.horizontal.height}px`,
            overflow: 'hidden',
            zIndex: 9,
            ...(this.horizontal.style || {})
        })
        this.horizontalScrollBar = createDom('div', 'horizontalScrollBar', 'right-scroll-bar', {
            position: 'absolute',
            top: '3px',
            left: 0,
            height: `${this.horizontal.height - 6}px`,
            width: `${this.horizontalScrollInfo.px}px`,
            borderRadius: '5px',
        })
        this.horizontalScrollSpeed = this.horizontalScrollInfo.percentage
        this.horizontalScrollBox.appendChild(this.horizontalScrollBar)
        this.vertical.ele.appendChild(this.horizontalScrollBox)
        this.horizontalScrollBarRect = this.horizontalScrollBar.getBoundingClientRect()
        return this.horizontalScrollBar
    }
    verticalDown = (e) => {
        this.vDownX = e.pageX
        this.vDownY = e.pageY
        this.vDown = true
        this.startVScrollBar = this.scrollBarTop
        this.startVScrollTop = this.scrollTop
    }
    /**
     * @desc 根据鼠标拖拽滚动条滚动的距离 计算表格滚动的距离
     * @param {Number} pageY
     * @param {Boolean} 
     */
    verticalMove = (pageY, auto) => {
        if (!this.hasVScroll()) return
        if (Math.abs(pageY - this.vDownY) < 3) {
            this.vMoving = false
            return
        }
        this.vMoving = true
        this.preVy = this.vMoveY || 0
        this.vMoveY = pageY
        const surplusHeight = this.verticalScrollInfo.surplusPx
        if (auto) {
            pageY = calcScorllPxByAutoPx(surplusHeight, this.maxScrollTop, pageY)
        }
        // 数据大时  this.vDownY取值会比pageY大 有误差
        // 如果pageY比较小 直接把vDownY=0
        if (pageY > 0 && pageY < 4) this.vDownY = 0
        this.vDistance = pageY - this.vDownY

        this.vBound = 0
        //向下移动
        if (this.preVy < this.vMoveY) {
            // 下边界
            if (this.startVScrollBar + this.vDistance >= surplusHeight) {
                this.setVerticalScrollBarPosi(surplusHeight)
                this.verticalScrollCb(this.maxScrollTop)
                this.vBound = 1
                return
            }
            // 超出上边界时 又向下移动 此时不需移动

            if (this.startVScrollBar + this.vDistance <= 0) {
                this.setVerticalScrollBarPosi(0)
                this.vBound = 1
                return
            }
            let top = this.startVScrollBar + (pageY - this.vDownY) //
            this.setVerticalScrollBarPosi(top)
            this.moveScrollTop = calcScrollPxByDist(
                this.vDistance,
                surplusHeight,
                this.maxScrollTop,
                this.startVScrollTop)
            this._updateScrollBarTop(top)
            this.setScrollTop(this.moveScrollTop)
            this.verticalScrollCb(this.moveScrollTop)
            // 向上移动
        } else {
            // 超出下边界 又向上移动 此时不需移动
            //if(this.vDown){
            if (this.startVScrollBar + this.vDistance >= surplusHeight) {
                return
            }
            //}
            // 上边界
            if (this.startVScrollBar + this.vDistance <= 0) {
                this.setVerticalScrollBarPosi(0)
                this.verticalScrollCb(0)
                this.vBound = 2
                return
            }

            let top = this.startVScrollBar + this.vDistance
            this.setVerticalScrollBarPosi(top)
            this.moveScrollTop = calcScrollPxByDist(
                this.vDistance,
                surplusHeight,
                this.maxScrollTop,
                this.startVScrollTop)
            this._updateScrollBarTop(top)
            this.setScrollTop(this.moveScrollTop)
            this.verticalScrollCb(this.moveScrollTop)
        }
    }
    verticalUp = (pageX, pageY) => {
        if (!this.vDown) return
        this.vDown = false
        if (!this.vMoving) return
        this.vUpX = pageX
        this.vUpY = pageY
        if (this.vBound === 1) {
            this._updateScrollBarTop(this.verticalScrollInfo.surplusPx)
            this.setScrollTop(this.maxScrollTop)
        } else if (this.vBound === 2) {
            this._updateScrollBarTop(0)
            this.setScrollTop(0)
        } else {
            this._updateScrollBarTop(this.scrollIngBarTop)
            this.setScrollTop(this.moveScrollTop)
        }
        // this.moveScrollTop = 0
        this.vDistance = 0
    }
    horizontalDown = (e) => {
        this.hDownX = e.pageX
        this.hDownY = e.pageY
        this.hDown = true
        this.hMoving = false
        this.startHScrollBar = this.scrollBarLeft
        this.startHScrollTop = this.scrollLeft
    }
    horizontalMove = (pageX, auto) => {
        if (!this.hasHScroll()) return
        if (Math.abs(pageX - this.hDownX) < 3) {
            this.hMoving = false
            return
        }
        this.hMoving = true
        this.preHx = this.hMoveX || 0
        this.hMoveX = pageX
        const surplusWidth = this.horizontalScrollInfo.surplusPx

        if (auto) {
            pageX = calcScorllPxByAutoPx(surplusWidth, this.maxScrollLeft, pageX)
        }

        this.hDistance = pageX - this.hDownX
        this.hBound = 0
        //向右移动
        if (this.preHx < this.hMoveX) {
            // 右边界
            if (this.startHScrollBar + this.hDistance >= surplusWidth) {
                this.setHorizontalScrollBarPosi(surplusWidth)
                this.horizontalScrollCb(this.maxScrollLeft)
                this.hBound = 1
                return
            }
            // 超出左边界时 又向右移动 此时不需移动
            if (this.startHScrollBar + this.hDistance <= 0) {
                return
            }

            let left = this.startHScrollBar + (pageX - this.hDownX)
            this.setHorizontalScrollBarPosi(left)
            this.moveScrollLeft = calcScrollPxByDist(
                this.hDistance,
                surplusWidth,
                this.maxScrollLeft,
                this.startHScrollTop)

            this._updateScrollLeftBarTop(left)
            this.setScrollLeft(this.moveScrollLeft)
            this.horizontalScrollCb(this.moveScrollLeft)

        } else {
            // 左边界
            if (this.startHScrollBar + this.hDistance <= 0) {
                this.setHorizontalScrollBarPosi(0)
                this.horizontalScrollCb(0)
                this.hBound = 2
                return
            }
            // 超出左边界 又向右移动 此时不需移动
            if (this.startHScrollBar + this.hDistance >= surplusWidth) {
                return
            }

            let left = this.startHScrollBar + this.hDistance
            this.setHorizontalScrollBarPosi(left)

            this.moveScrollLeft = calcScrollPxByDist(
                this.hDistance,
                surplusWidth,
                this.maxScrollLeft,
                this.startHScrollTop)
            this._updateScrollLeftBarTop(left)
            this.setScrollLeft(this.moveScrollLeft)
            this.horizontalScrollCb(this.moveScrollLeft)
        }
    }
    horizontalUp = (pageX, pageY) => {
        if (!this.hDown) return
        this.hDown = false
        if (!this.hMoving) return
        this.hDownX = pageX
        this.hDownY = pageY

        if (this.hBound === 1) {
            this.scrollBarLeft = this.horizontalScrollInfo.surplusPx
            this.setScrollLeft(this.maxScrollLeft)
        } else if (this.hBound === 2) {
            this.scrollBarLeft = 0
            this.setScrollLeft(0)
        } else {
            this.scrollBarLeft = this.scrollIngBarLeft//this.hDistance
            this.setScrollLeft(this.moveScrollLeft)
        }
        // this.moveScrollLeft = 0
        this.hDistance = 0

    }

    bindWheelEvent = () => {
        if (!this.eventBindEle) return
        this.eventBindEle.addEventListener(this.isFirefox ? 'DOMMouseScroll' : 'mousewheel', (e) => {
            const { wheelDelta } = e,
                wheelDelta2 = wheelDelta < 0 ? 100 : -100,
                maxScrollTop = this.maxScrollTop
            let scrollTop = this.scrollTop
            if (maxScrollTop <= 0) return
            // 向下临界
            if (maxScrollTop <= scrollTop && wheelDelta2 > 0) return
            // 向上临界
            if (scrollTop <= 0 && wheelDelta2 < 0) return

            scrollTop = scrollTop + (wheelDelta2) * 0.2 //this.verticalScrollSpeed
            scrollTop = Number(scrollTop.toFixed(2))
            let scrollP = Math.abs(scrollTop) / maxScrollTop,
                relScrollTop = Math.floor(scrollP * maxScrollTop)

            if (scrollTop < 0) {
                relScrollTop = 0
                scrollP = 0
            }
            if (scrollP >= 1) {
                relScrollTop = maxScrollTop
                scrollP = 1
            }
            this.setScrollTop(relScrollTop)
            this._updateScrollBarTop(scrollP * this.verticalScrollInfo.surplusPx)
            this.setVerticalScrollBarPosi(this.scrollBarTop)
            this.verticalScrollCb(this.scrollTop)
        })
    }
    setScrollTop = (scrollTop = 0) => {
        this.scrollTop = scrollTop
    }
    setScrollLeft = (scrollLeft = 0) => {
        this.scrollLeft = scrollLeft
    }
    // 根据scrollTop重绘纵向滚动条
    vScrollChangeUpdate = (scrollTop) => {
        this.setScrollTop(scrollTop)
        this._updateScrollBarTop()
        this.setVerticalScrollBarPosi(this.scrollBarTop)
        this.verticalScrollCb(scrollTop)
    }
    // 根据scrollLeft重绘横向滚动条
    hScrollChangeUpdate = (scrollLeft) => {
        this.setScrollLeft(scrollLeft)
        this._updateScrollLeftBarTop()
        this.setHorizontalScrollBarPosi(this.scrollBarLeft)
        this.horizontalScrollCb(scrollLeft)
    }
    setVerticalScrollBarPosi = (top = 0) => {
        if (this.verticalScrollBar) {
            this.scrollIngBarTop = top
            this.verticalScrollBar.style.top = `${top}px`
        }
    }
    setHorizontalScrollBarPosi = (left = 0) => {
        if (this.horizontalScrollBar) {
            this.scrollIngBarLeft = left
            this.horizontalScrollBar.style.left = `${left}px`
        }

    }
    handleMouseMove = (e) => {
        if (this.autoScroll) return
        this.vDown && this.verticalMove(e.pageY)
        this.hDown && this.horizontalMove(e.pageX)
    }
    getMouseDownStatus = () => {
        return this.vDown || this.hDown
    }
    handleMouseUp = (e) => {
        this.autoScroll = false
        this.verticalUp(e.pageX, e.pageY)
        this.horizontalUp(e.pageX, e.pageY)
    }

    startAutoScrollH = () => {
        this.autoScroll = true
        const center = calcCenterXy(this.horizontalScrollBarRect)
        this.horizontalDown(center)
        return center
    }

    startAutoScrollV = () => {
        this.autoScroll = true
        const center = calcCenterXy(this.verticalScrollBarRect)
        this.verticalDown(center)
        return center
    }

    // 根据内容高度更新滚动条
    updateScrollTopByNodeSize = (opt) => {
        this.vertical.contentPx = opt.vertical.contentPx
        if (opt.vertical.containerPx) {
            this.vertical.containerPx = opt.vertical.containerPx
        }
        this.verticalScrollInfo = getScrollBarPx(this.vertical.containerPx, this.vertical.contentPx)
        this.verticalScrollSpeed = this.verticalScrollInfo.percentage
        let maxScrollTop = this.vertical.contentPx - this.vertical.containerPx
        this.maxScrollTop = maxScrollTop > 0 ? maxScrollTop : 0
        this._updateScrollBarTop(undefined)
        this.setVerticalScrollBarPosi(this.scrollBarTop)
        this.initShow()
        this.verticalScrollBox.style.height = this.vertical.containerPx + 'px'
        this.verticalScrollBar.style.height = this.verticalScrollInfo.px + 'px'
        this.verticalScrollBarRect = this.verticalScrollBar.getBoundingClientRect()
        if (this.maxScrollTop === 0) {
            this.setScrollTop(0)
        }
        opt.cb && opt.cb(this.scrollTop)
        return {
            scrollTop: this.scrollTop
        }
    }
    _updateScrollBarTop = (top) => {
        this.scrollBarTop = top >= 0 ? top : Math.abs(this.scrollTop) / this.maxScrollTop * this.verticalScrollInfo.surplusPx
    }

    // 根据内容宽度更新滚动条
    updateScrollLeftByNodeSize = (opt) => {
        this.horizontal.contentPx = opt.horizontal.contentPx
        this.horizontal.style = opt.horizontal.style
        if (opt.horizontal.containerPx) {
            this.horizontal.containerPx = opt.horizontal.containerPx
        }
        this.horizontalScrollInfo = getScrollBarPx(this.horizontal.containerPx, this.horizontal.contentPx)
        this.horizontalScrollSpeed = this.horizontalScrollInfo.percentage
        let maxScrollLeft = this.horizontal.contentPx - this.horizontal.containerPx
        this.maxScrollLeft = maxScrollLeft > 0 ? maxScrollLeft : 0
        this._updateScrollLeftBarTop()
        this.setHorizontalScrollBarPosi(this.scrollBarLeft)
        this.initShow()
        this.horizontalScrollBox.style.width = this.horizontal.containerPx + 'px'
        this.horizontalScrollBox.style.left = this.horizontal.style.left
        if (this.horizontalScrollBar) {
            this.horizontalScrollBar.style.width = this.horizontalScrollInfo.px + 'px'
            this.horizontalScrollBarRect = this.horizontalScrollBar.getBoundingClientRect()
        }
        if (this.maxScrollLeft === 0) {
            this.setScrollLeft(0)
        }
        opt.cb && opt.cb(this.scrollLeft)
        return {
            scrollLeft: this.scrollLeft
        }

    }
    _updateScrollLeftBarTop = (left) => {
        this.scrollBarLeft = left || Math.abs(this.scrollLeft) / this.maxScrollLeft * this.horizontalScrollInfo.surplusPx
    }
    destroy = () => {
        document.body.removeEventListener('mousemove', this.handleMouseMove)
        document.body.removeEventListener('mouseup', this.handleMouseUp)
    }
}

export default ScrollBar

/**
 * @desc 根据拖拽滚动条的距离 计算table应该滚动的距离
 * @param {*} dist 
 * @param {*} surplusPx 
 * @param {*} maxScrollPx 
 * @param {*} curScrollPx 
 */
const calcScrollPxByDist = (dist, surplusPx, maxScrollPx, curScrollPx) => {
    let scrollPx = (dist / surplusPx) * maxScrollPx + curScrollPx
    if (scrollPx < 0) {
        scrollPx = 0
    } else if (scrollPx > maxScrollPx) {
        scrollPx = maxScrollPx
    }
    return scrollPx
}

/**
 * @desc 计算一个矩形的中心坐标
 * @param {*} rect 
 */
const calcCenterXy = (rect) => {
    return {
        pageX: Math.floor((rect.bottom - rect.top) / 2),
        pageY: Math.floor((rect.right - rect.left) / 2)
    }
}

/**
 * @desc 根据自动滚动是table滚动的px计算滚动条应该滚动的距离
 * @param {*} surplusPx 滚动条剩余px(宽或者高)
 * @param {*} maxScrollPx 盒子最大能滚动的px像素值
 * @param {*} autoPx 表格滚动了的像素值
 */
const calcScorllPxByAutoPx = (surplusPx, maxScrollPx, autoPx) => {
    return surplusPx / maxScrollPx * autoPx
}