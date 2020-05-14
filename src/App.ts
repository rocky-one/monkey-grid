import Base from './core/Base';
// 1. 链表
// 2. 时间切片
const data = [];
for(let i = 0;i<100;i++){
	let row = []
	for(let j = 0; j<20;j++){
		row.push({
			row: i,
			col: j,
			value: `${i},${j}`,
			id: `${i},${j}`
		})
	}
}
new Base({
	container: document.getElementById('app'),
	width: 600,
	height: 600,
	data
});
