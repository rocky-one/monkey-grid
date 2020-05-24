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

export function getExploreType() {
    var explorer = window.navigator.userAgent
    if (explorer.indexOf("MSIE") >= 0) {
        return 'IE'
    }
    else if (explorer.indexOf("Firefox") >= 0) {
        return 'Firefox'
    }
    else if(explorer.indexOf("Chrome") >= 0){
        return 'Chrome'
    }
    else if(explorer.indexOf("Opera") >= 0){
        return 'Opera'
    }
    else if(explorer.indexOf("Safari") >= 0){
        return 'Safari'
    }
}

export const explorerType = getExploreType()
