import MonkeyGrid from './core/MonkeyGrid';
// 1. 链表
// 2. 时间切片
const data = [];
for(let i = 0;i<3;i++){
	let row = []
	for(let j = 0; j<12;j++){
		row.push({
			// row: i,
			// col: j,
			value: `${i},${j}`,
			// id: `${i},${j}`
		})
	}
	data.push(row)
}
const mG = new MonkeyGrid({
	container: document.getElementById('app'),
	width: 600,
	height: 600,
	data: data
})
const sheet = mG.addSheet('sheet1', 40, 12)
sheet.addTable('table1', 0, 0, data)
sheet.point()
// const box = document.getElementById('app')
// console.log(box.scrollHeight, box.clientHeight, 333)