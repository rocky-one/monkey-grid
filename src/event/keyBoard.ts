import { PointRange } from './../interface/SheetInterface';
import keyboardJS from 'keyboardjs'
import { forEachSheetDataBySelectedRange } from '../core/utils/sheetUtils'

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
	// target.id = 'textareaCopy'
	document.body.appendChild(target)
	target.textContent = text
	target.focus()
	target.setSelectionRange(0, target.value.length)
	document.execCommand('copy')
	document.body.removeChild(target)
}

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
		let prows = txt.split(lineWarp)
		// 解决web端和Excel端读取剪切板数据的差异性
		for (let i = 0; i < prows.length; i++) {
			copyData[i] = prows[i].split('\t').map(v => {
				return v.replace(/^\"|\"$/g, '')
			});
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
keyboardJS.bind('command + c', (e) => {
	const sheet = keyBoardData.sheet
	if (!sheet) return
	const selectedRange = sheet.selectedRange
	const sheetData = sheet.sheetData
	let value = ''
	forEachSheetDataBySelectedRange(selectedRange, sheetData, (cell: any, row: number, col: number) => {
		if (!cell.pointer) {
			if (col === selectedRange[3]) {
				value += `${cell.value}\n`
			} else {
				value += `${cell.value}\t`
			}
		}
	})
	execCommandCopy(value)
	console.log(value, 'command--c')
})

// keyboardJS.bind('command + v', (e) => {
// 	e.stopImmediatePropagation();
// 	let clipboardData = window.clipboardData || e.clipboardData; // IE || chrome
// 	console.log(e, clipboardData, 'clipboardData')
// 	const clipObj = getClipboardData(clipboardData);
// 	console.log(clipObj, 'command--v')
// })

function paste(event: any) {
	const clipboardData = event.clipboardData || window.clipboardData
	const clipObj: any = getClipboardData(clipboardData)
	console.log(clipObj, 'command--v')
	const data = clipObj.copyData
	const range = keyBoardData.sheet.selectedCell.range
	const row = range[0]
	const col = range[1]

	data.forEach((vals: any[], i: number) => {
		vals.forEach((v: any, j: number) => {
			keyBoardData.sheet.setCellValue(row + i, j + col, v)
		})
	})
	// event.preventDefault();
}

document.addEventListener('paste', paste);



keyboardJS.bind('', (e) => {
	const keyCode = e.keyCode
	keyBoardData.sheet.textareaInstance.setValue('eeee');
	console.log(e, keyCode, 'any key was pressed');
  });

export default function keyBoardInit(sheet: any) {
	keyBoardData.sheet = sheet

	return () => {
		Object.keys(keyBoardData).forEach(key => keyBoardData[key] = null)
		document.removeEventListener('paste', paste);
	}
}