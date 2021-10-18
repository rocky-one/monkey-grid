import MonkeyGrid from './core/MonkeyGrid';
// 1. 链表
// 2. 时间切片
let rowLen = 300;
let colLen = 20
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
data[1][1].rowspan = 12
data[5][3].rowspan = 1
data[5][3].colspan = 4
data[7][3].rowspan = 3
data[7][3].colspan = 3
data[1][1].style = {
	fontSize: '16px',
	fontWeight: 600,
	// fontFamily: 'arial',
	color: 'red'
}
const mG = new MonkeyGrid({
	container: document.getElementById('tableBox'),
	width: 700,
	height: 600,
	order: true,
	headerOrder: true,
	frozenRowCount: 1,
	frozenColCount: 2
})
const sheet = mG.addSheet('sheet1', rowLen+2000, colLen+2000)
// sheet.setMergeCells(1, 1, 12, 1)
// sheet.setMergeCells(5, 3, 1, 5)
// sheet.setMergeCells(7, 3, 3, 3)
sheet.addTable('table1', 0, 0, data)
sheet.point()

const addButton = document.getElementById('addButton')
addButton.addEventListener('click', () => {
	// sheet.addTable('table1', 403, 10, [
	// 	[{value: 'gg'}, {value: 'gg11'}],
	// 	[{value: 'ee'}, {value: 'ee11'}]
	// ])

	// sheet.setRowHeight(8, 40)
	// sheet.setColWidth(4, 120)
	sheet.removeMergeCells(7, 4, 3, 3)
})