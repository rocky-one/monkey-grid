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
			value: `${i},${j}`,
			// rowspan: 1,
			// colspan: 1,
		})
	}
	data.push(row)
}
// data[1][1].rowspan = 30
// data[5][3].colspan = 4
// data[7][3].rowspan = 3
// data[7][3].colspan = 3
const mG = new MonkeyGrid({
	container: document.getElementById('tableBox'),
	width: 800,
	height: 600,
	order: true,
	headerOrder: true,
	frozenRowCount: 1,
	frozenColCount: 2
})
const sheet = mG.addSheet('sheet1', rowLen+20, colLen+20)
sheet.setMergeCells(1, 1, 30, 1)
sheet.setMergeCells(5, 3, 5, 8)
sheet.setMergeCells(7, 3, 10, 6)
console.log(sheet.sheetData, '3')
sheet.addTable('table1', 0, 0, data)
sheet.point()