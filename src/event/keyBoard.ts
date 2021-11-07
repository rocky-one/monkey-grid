import keyboardJS from 'keyboardjs'
import { forEachSheetDataBySelectedRange } from '../utils/sheetUtils'

const keyBoardData = {
	sheet: null
}

/**
 * @desc 复制到剪切板
 * @param text 
 */
const execCommandCopy = (text: string) => {
	let target = document.createElement('textarea')
	target.style.position = 'absolute'
	target.style.left = '-9999px'
	target.style.top = '0'
	document.body.appendChild(target)
	target.textContent = text
	target.focus()
	target.setSelectionRange(0, target.value.length)
	document.execCommand('copy')
	document.body.removeChild(target)
}

keyboardJS.bind('command + c', (e) => {
	const sheet = keyBoardData.sheet
	if (!sheet) return
	// if (sheet.textareaInstance.isFocus) return
	const selectedRange = sheet.selectedRange
	const sheetData = sheet.sheetData
	let value = ''
	forEachSheetDataBySelectedRange(selectedRange, sheetData, sheet.getCellInfo, (cell: any, row: number, col: number) => {
		if (!sheet.gePointer(row, col)) {
			if (col === selectedRange[3]) {
				value += `${cell.value}\n`
			} else {
				value += `${cell.value}\t`
			}
		}
	})
	execCommandCopy(value)
})

// 回撤
keyboardJS.bind('command + z', (e) => {
	const sheet = keyBoardData.sheet
	const record = sheet.record
	record.undo()
})

keyboardJS.bind('control + z', (e) => {
	const sheet = keyBoardData.sheet
	const record = sheet.record
	record.undo()
})

// 返回撤
keyboardJS.bind('command + shift + z', (e) => {
	const sheet = keyBoardData.sheet
	const record = sheet.record
	record.redo()
})

keyboardJS.bind('control + y', (e) => {
	const sheet = keyBoardData.sheet
	const record = sheet.record
	record.redo()
})

keyboardJS.bind('up', (e) => {
	keyBoardData.sheet.moveSelectedCell('up')
})

keyboardJS.bind('down', (e) => {
	keyBoardData.sheet.moveSelectedCell('down')
})

keyboardJS.bind('left', (e) => {
	keyBoardData.sheet.moveSelectedCell('left')
})

keyboardJS.bind('right', (e) => {
	keyBoardData.sheet.moveSelectedCell('right')
})

keyboardJS.bind('tab', (e) => {
	keyBoardData.sheet.moveSelectedCell('right', true)
})

keyboardJS.bind('enter', (e) => {
	e.preventDefault()
	keyBoardData.sheet.moveSelectedCell('down')
})

// 当获取到焦点时 不需要响应的键盘按键
const noInputCodeMap = {
	9: '右箭头@',
	20: '中英文',
	16: 'shift',
	17: 'control',
	18: 'option',
	91: 'command',
	13: '回车',
	38: '上',
	40: '下',
	37: '左',
	39: '右'
}
const keyDownMap = {
	17: false, //'control',
	91: false, //'command',
}

export const getHasShortcutKey = () => {
	return Object.keys(keyDownMap).find(key => keyDownMap[key])
}

keyboardJS.bind('', (event) => {
	const keyCode = event.keyCode
	if (keyDownMap.hasOwnProperty(keyCode)) {
		keyDownMap[keyCode] = true
	}
	// 选中一个单元格 直接录入时 需要清空单元格value
	if (!keyBoardData.sheet.textareaInstance.isShow && !noInputCodeMap[keyCode] && !getHasShortcutKey()) {
		keyBoardData.sheet.textareaInstance.setValue('')
	}

});

function onKeyUp(event: any) {
	const keyCode = event.keyCode
	if (keyDownMap.hasOwnProperty(keyCode)) {
		keyDownMap[keyCode] = false
	}
}

window.addEventListener('keyup', onKeyUp)

export default function keyBoardInit(sheet: any) {
	keyBoardData.sheet = sheet

	return () => {
		Object.keys(keyBoardData).forEach(key => keyBoardData[key] = null)
		window.removeEventListener('keyup', onKeyUp)
	}
}