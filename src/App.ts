import MonkeyGrid from './core/MonkeyGrid';
// 1. 链表
// 2. 时间切片
const data = [];
for(let i = 0;i<40;i++){
	let row = []
	for(let j = 0; j<12;j++){
		row.push({
			value: `${i},${j}`,
			rowspan: 1,
			colspan: 1
		})
	}
	data.push(row)
}
data[1][1].rowspan = 30
data[5][3].colspan = 4
data[7][3].rowspan = 3
data[7][3].colspan = 3
console.log(data)
const mG = new MonkeyGrid({
	container: document.getElementById('app'),
	width: 600,
	height: 600,
	// data: data,
	order: true,
	headerOrder: true,
	frozenRowCount: 1,
	frozenColCount: 1
})
const sheet = mG.addSheet('sheet1', 40, 12)
sheet.addTable('table1', 0, 0, data)
sheet.point()
// const box = document.getElementById('app')
// console.log(box.scrollHeight, box.clientHeight, 333)