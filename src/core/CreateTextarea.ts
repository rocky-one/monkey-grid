import * as domCore from '../utils/dom'
import { getHasShortcutKey } from '../event/keyBoard'
// 处理剪切板数据 \n 换行   \t 下一个单元格   \r\n 换行
const getClipboardData = (clipboardData: any) => {
	if (clipboardData) {
		let txt = clipboardData.getData('text')
		let copyData = new Array()
		if (!txt) {
			return false
		}
		let lineWarp = ''
		while (txt.length > 0) {
			let c = txt.charAt(txt.length - 1)
			if (c === '\n') {
				txt = txt.substring(0, txt.length - 1)
				lineWarp = `${c}${lineWarp}`
			} else if (c === '\r') {
				txt = txt.substring(0, txt.length - 1)
				lineWarp = `${c}${lineWarp}`
			}else {
				break;
			}
		}
		if (lineWarp) {
			let prows = txt.split(lineWarp)
			// 解决web端和Excel端读取剪切板数据的差异性
			for (let i = 0; i < prows.length; i++) {
				copyData[i] = prows[i].split('\t').map(v => {
					return v.replace(/^\"|\"$/g, '')
				});
			}
		} else {
			copyData[0] = [txt]
		}
		
		let height = copyData.length || 0,
			width = copyData[0].length || 0
		return {
			copyData,
			height,
			width
		}
	}
}

/**
 * container 容器
 * blurCb 失去焦点回调
 */
class CreateTextarea {
    constructor(option) {
        this.option = option || {}
        this.init()
    }
    instance: any = null
    option: any = {}
    outerConainer: HTMLElement
    container: HTMLElement
    textarea: HTMLElement
    isShow: boolean = false
    isFocus: boolean = false
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
            zIndex: -1,
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
            float: 'none',
            fontSize: '12px'
        })
        this.container.appendChild(this.textarea)
        const con = this.outerConainer = this.option.container || document.body
        con.appendChild(this.container)
        this.textarea.addEventListener('blur', this.blur)
        this.textarea.addEventListener('copy', this.onCopy)
        this.textarea.addEventListener('paste', this.onPaste)
        this.textarea.addEventListener('input', this.onChange)
    }
    onCopy = (event) => {
        console.log(event)
    }
    onPaste = (event) => {
        const sheet = this.option.sheet
        const clipboardData = event.clipboardData || window.clipboardData
        const clipObj: any = getClipboardData(clipboardData)
        const data = clipObj.copyData
        const range = sheet.selectedCell.range
        const row = range[0]
        const col = range[1]
        const setCellValueData = []
        data.forEach((vals: any[], i: number) => {
            vals.forEach((v: any, j: number) => {
                const oldVal = sheet.sheetData[row + i][j + col].value
                sheet.setCellValue(row + i, j + col, v, {point: false, record: false})
                setCellValueData.push({
                    row: row + i,
                    col: j + col,
                    oldValue: oldVal,
                    value: v,
                    extend: {
                        point: true,
                        record: false
                    }
                })
            })
        })
        this.setValue(data[0][0])
        sheet.point()
        sheet.record.add({
            setCellValue: setCellValueData,
            setSelectedCell: {...sheet.selectedCell},
            setSelectedRange: [...sheet.selectedRange]
        })
        event.preventDefault()
    }
    onChange = (event) => {
        if (!getHasShortcutKey()) {
            this.show()
        }
        // const sheet = this.option.sheet
        // sheet.setCellValue(sheet.selectedCell.range[0], sheet.selectedCell.range[1], event.target.innerText, {point: false})
    }
    blur = (event) => {
        const sheet = this.option.sheet
        sheet.setCellValue(sheet.selectedCell.range[0], sheet.selectedCell.range[1], event.target.innerText)
        this.isFocus = false
    }
    setValue = (value = '') => {
        if (!this.textarea) {
            this.init()
        }
        this.textarea.innerText = value
    }
    getValue = () => {
        return this.textarea.innerText
    }
    show = () => {
        if (this.isShow) {
            return
        }
        this.isShow = true
        this.container.style.zIndex = '2'
    }
    hide = () => {
        if (!this.isShow) {
            return
        }
        this.isShow = false
        this.container.style.zIndex = '-1'
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
            this.isFocus = true
        }, 0)
    }
    resetPosition = (style: any = {}) => {
        setTimeout(() => {
            this.updatePosition(style)
        }, 20)
    }
    updatePosition = (style: any) => {
        const sheet = this.option.sheet
            const cell = sheet.selectedCell
            const newStyle = {
                width: cell.width,
                height: cell.height,
                left: cell.x,
                top: cell.y,
                scrollLeft: sheet.scrollBar.getHorizontal().scrollLeft,
                scrollTop: sheet.scrollBar.getVertical().scrollTop
            }
            style = Object.assign(newStyle, style)
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
                // this.container.style.boxShadow = null
            } else {
                this.container.style.border = null
                // this.container.style.boxShadow = 'rgba(0, 0, 0, 0.4) 1px 2px 5px'
            }
    }
    changeSelectedCell = (sheet: any) => {
        this.resetPosition()
        this.setValue(sheet.selectedCell.value)
        if (sheet.isDbClick) {
            this.show()
        }
        this.focus()
    }
    destroy = () => {
        this.textarea.removeEventListener('blur', this.blur)
        this.textarea.removeEventListener('copy', this.onCopy)
        this.textarea.removeEventListener('paste', this.onPaste)
        this.textarea.removeEventListener('input', this.onChange)
        if (this.outerConainer && this.container) {
            this.outerConainer.removeChild(this.container)
        }
        this.container = null
        this.instance = null
        this.textarea = null
        this.option = null
    }
    getInstance = (option) => {
        if (!this.instance) {
            this.instance = new CreateTextarea(option)
        }
        return this.instance
    }

}

export default CreateTextarea