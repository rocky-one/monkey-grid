import MonkeyGrid from './core/MonkeyGrid';
// 1. 链表
// 2. 时间切片
let rowLen = 100;
let colLen = 10
const data = [];
for(let i = 0;i<rowLen;i++){
	let row = []
	for(let j = 0; j<colLen;j++){
		row.push({
			value: `${i},${j}`
		})
	}
	data.push(row)
}
// data[0][0].colspan = 2
data[1][1].rowspan = 12
data[5][3].rowspan = 1
data[5][3].colspan = 4
data[7][3].rowspan = 3
data[7][3].colspan = 3
data[1][1].style = {
	fontSize: '16px',
	fontWeight: 600,
	// fontFamily: 'arial',
	color: 'red',
	backgroundColor: 'green'
}
data[1][3].value = 1234.52234
data[1][3].type = 'number'
data[1][3].format = '###.##'

data[1][4].value = '2021/10/30'
data[1][4].type = 'date'
data[1][4].format = 'YYYY-MM-DD'


const mG = new MonkeyGrid({
	container: document.getElementById('tableBox'),
	width: 700,
	height: 600,
	order: true,
	headerOrder: true,
	
})
const sheet = mG.addSheet({
	name: 'sheet11',
	rowCount:rowLen+20,
	colCount: colLen+10,
	frozenRowCount: 1,
	frozenColCount: 2
})
// sheet.setMergeCells(1, 1, 12, 1)
// sheet.setMergeCells(5, 3, 1, 5)
// sheet.setMergeCells(7, 3, 3, 3)
sheet.addTable('table1', 0, 0, data)
sheet.paint()

const addButton = document.getElementById('addButton')
addButton.addEventListener('click', () => {
	// sheet.addTable('table1', 403, 10, [
	// 	[{value: 'gg'}, {value: 'gg11'}],
	// 	[{value: 'ee'}, {value: 'ee11'}]
	// ])
	// sheet.setRowHeight(8, 40)
	// sheet.setColWidth(4, 120)
	// sheet.removeMergeCells(7, 4, 3, 3)

	// sheet.setCellStyle(7, 3, {
	// 	backgroundColor: '#000',
	// 	color: '#fff'
	// })

	// sheet.addRow(sheet.sheetData.length)
	// sheet.addCol(4)
	// sheet.setFrozenRowCount(0)
	// sheet.setFrozenColCount(0)
	mG.onResize(600, 500)
})