import * as domCore from '../utils/dom'
/**
 * container 容器
 * blurCb 失去焦点回调
 */
class CreateTextarea {
    constructor(option) {
        this.option = option || {}
        this.onCopy = option.onCopy
        this.onPaste = option.onPaste
        this.init()
    }
    instance: any = null
    option: any = {}
    onCopy: Function
    onPaste: Function
    outerConainer: HTMLElement
    container: HTMLElement
    textarea: HTMLElement
    init = () => {
        this.container = domCore.createDom('div', {}, {
            position: 'absolute',
            overflow: 'hidden',
            margin: '0px',
            padding: '0px',
            boxSizing: 'content-box',
            resize: 'none',
            outline: 'none',
            backgroundColor: 'white',
            zIndex: 2000,
            top: 0,
            left: 0,
            width: 0,
            height: 0,
        })
        this.textarea = domCore.createDom('div', {
            tabindex: -1,
            autocomplete: 'off',
            contenteditable: 'true',
            gcuielement: 'gcEditingInput',
            'data-key': this.option.key,
        }, {
            outline: 'none',
            resize: 'none',
            border: 'none',
            padding: '1px',
            verticalAlign: 'top',
            minHeight: 0,
            boxSizing: 'content-box',
            overflowWrap: 'normal',
            overflow: 'hidden',
            wordBreak: 'normal',
            textAlign: 'left',
            width: '100%',
            height: '100%',
            float: 'none'
        })
        this.container.appendChild(this.textarea)
        const con = this.outerConainer = this.option.container || document.body
        con.appendChild(this.container)
        this.textarea.addEventListener('blur', this._blur, false)
        this.textarea.addEventListener('copy', this.onCopy)
        this.textarea.addEventListener('paste', this.onPaste)
    }
    _blur = (event) => {
        this.option.blurCb(event.target)
    }
    blur = () => {
        this.textarea.blur()
    }
    setValue = (value = '') => {
        if (!this.textarea) {
          this.init()
        }
        console.log(value, 321)
        this.textarea.innerText = value
    }
    getValue = () => {
        return this.textarea.innerText
    }
    focus = (checkAll = false) => {
        setTimeout(() => {
            if (window.getSelection) {//ie11 10 9 ff safari
                if (this.textarea === undefined) return
                this.textarea.focus()
                let range = window.getSelection();//创建range
                range.selectAllChildren(this.textarea);//range 选择obj下所有子内容
                range.collapseToEnd();//光标移至最后
                if (checkAll) {
                    let range = document.createRange();
                    range.selectNodeContents(this.textarea);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                }
            } else if (document.selection) {//ie10 9 8 7 6 5
                let range = document.selection.createRange();//创建选择对象
                //let range = document.body.createTextRange();
                range.moveToElementText(this.textarea);//range定位到obj
                range.collapse(false);//光标移至最后
                range.select();
                if (checkAll) {
                    let range = document.body.createTextRange();
                    range.moveToElementText(this.textarea);
                    range.select();
                }
            }
        }, 0)
    }
    resetPosition = (style) => {
        setTimeout(() => {
            const heightCutFour = style.height - 5 > 0 ? style.height - 5 : 0
            const widthCutFour = style.width - 5 > 0 ? style.width - 5 : 0
            const top = style.top - style.scrollTop > 0 ? style.top - style.scrollTop : 0
            const left = style.left - style.scrollLeft > 0 ? style.left - style.scrollLeft : 0
            const width = style.scrollLeft - style.left > 0
                ? style.width - (style.scrollLeft - style.left) - 5
                : widthCutFour
            const height = style.scrollTop - style.top > 0
                ? style.height - (style.scrollTop - style.top) - 5
                : heightCutFour
            if (style.left >= 0) {
                this.container.style.top = `${top + 3}px`
                this.container.style.left = `${left + 3}px`
                this.container.style.width = `${width}px`
                this.container.style.height = `${height}px`
            } else {
                this.container.style.top = `${top + 3}px`
                this.container.style.left = `${style.left + 3}px`
                this.container.style.width = `${style.width - 5}px`
                this.container.style.height = `${style.height - 5}px`
            }
            if (style.top - style.scrollTop < 0) {
                this.container.style.width = `0px`
                this.container.style.height = `0px`
            }
            if (width === 0) {
                this.container.style.border = null
                this.container.style.boxShadow = null
            } else {
                this.container.style.border = null//'2px solid rgb(82, 146, 247)'
                this.container.style.boxShadow = 'rgba(0, 0, 0, 0.4) 1px 2px 5px'
            }
        }, 20)
    }
    destroy = () => {
        this.textarea.removeEventListener('blur', this._blur, false)
        if (this.outerConainer && this.container) {
            this.outerConainer.removeChild(this.container)
        }
        this.container = null
        this.instance = null
        this.textarea = null
    }
    getInstance = (option) => {
        if (!this.instance) {
            this.instance = new CreateTextarea(option)
        }
        return this.instance
    }

}

export default CreateTextarea