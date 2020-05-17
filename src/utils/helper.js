import { Row } from "antd"

// 延迟执行
export function defer(callback){
    setTimeout(callback, 0)
}

// 初始化数据
export function initData(data = [], rowHeight = 24, colWidth = 100) {
    let y = 0
    for(let i = 0; i < data.length; i++) {
        const row = data[i]
        let x = 0
        for(let j = 0; j < row.length; j++) {
            const cell = row[j]
            cell.width = colWidth
            cell.height = rowHeight
            cell.y = y
            cell.x = x
            x += colWidth
        }
        y += rowHeight
    }
    
    return data
}