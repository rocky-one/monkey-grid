import { SheetOptions, PointRange } from '../interface/SheetInterface'
import { calcStartRowIndex, calcEndRowIndex, calcStartColIndex, calcEndColIndex, getCellInFrozenByIndex, pxToNum, getObjectAttrDefault } from '../utils/helper'
import { LEFT_ORDER_WIDTH, HEADER_ORDER_HEIGHT, FONT_FAMILY, BORDER_COLOR } from './const'
import { numToABC, inFrozenOnBody } from '../utils/sheetUtils'
import Base from './Base'

export default class Point extends Base {
	constructor(options: SheetOptions) {
        super(options)
	}
	pointRange: PointRange = {
		startRowIndex: 0,
		endRowIndex: 0,
		startColIndex: 0,
		endColIndex: 0,
		// 拖拽选中超出边界时，记录当前应该选中的行列位置
		// 因为自动滚动选中后定时器问题会导致形参永远时初始值，这里改成对象指针就可以解决此问题
		boundEndCol: 0,
		boundEndRow: 0
	}
    public clearPoint = () => {
        const canvasContext = this.options.canvasContext
        canvasContext.clearRect(0, 0, this.options.canvas.width, this.options.canvas.height);
    }
	/**
	* 绘制整个sheet画布
	*/
	public point = () => {
        if (!this.active) return
		const sheetData = this.sheetData
		const canvasContext = this.options.canvasContext
        // canvasContext.height = canvasContext.height
        canvasContext.clearRect(0, 0, this.options.canvas.width, this.options.canvas.height);
		canvasContext.lineWidth = 1
		let startRowIndex = calcStartRowIndex(this)
		let endRowIndex = calcEndRowIndex(startRowIndex, this.clientHeight, sheetData, this.rowDataMap)
		let startColIndex = calcStartColIndex(this)
		let endColIndex = calcEndColIndex(startColIndex, this.clientWidth, sheetData, this.colDataMap)
		canvasContext.font = `${this.font}px ${FONT_FAMILY}`
		// startRowIndex = startRowIndex + this.frozenRowCount
		endRowIndex = endRowIndex + this.frozenRowCount
		// startColIndex = startColIndex + this.frozenColCount
		endColIndex = endColIndex + this.frozenColCount
		if (startRowIndex < 0) startRowIndex = 0
		if (endRowIndex >= this.getRowCount() - 1) endRowIndex = this.getRowCount() - 1
		if (startColIndex < 0) startColIndex = 0
		if (endColIndex >= this.getColCount()) endColIndex = this.getColCount() - 1
		this.pointRange.startRowIndex = startRowIndex
		this.pointRange.endRowIndex = endRowIndex
		this.pointRange.startColIndex = startColIndex
		this.pointRange.endColIndex = endColIndex
		const pointedMap = {}
		// 绘制table部分
		this.pointBody(startRowIndex, endRowIndex, startColIndex, endColIndex, pointedMap)
		// 冻结列头
		this.pointFrozenCol(startRowIndex, endRowIndex, pointedMap)
		// 冻结行头
		this.pointFrozenRow(startColIndex, endColIndex, pointedMap)

		// 头部列标A，B，C....
		this.pointTopOrder(startColIndex, endColIndex)
		// 头部选择 背景下划线效果
		this.pointCellTopBorder()

		// 左上角 冻结头部列标 A，B,
		this.pointTopOrder(0, this.frozenColCount - 1, true)
		
		// 绘制左侧序号 1,2,3...
		this.pointLeftOrder(startRowIndex, endRowIndex)
		// 左侧选择 背景下划线效果
		this.pointCellLeftBorder()
		// 绘制左侧序号 冻结序号情况
		this.pointLeftOrder(0, this.frozenRowCount - 1, true)
		
		// 如果有冻结行列，绘制body区域左上角冻结区域
		this.pointLeftTopByFrozenOnBody()

		// 如果有行列标，绘制左上角空白区域
		this.pointLeftTopByFrozen()

		// 绘制冻结区域选中效果
		this.pointSelectedRange()

		if (this.textareaInstance.isShow) {
			this.textareaInstance.updatePosition();
		}
	}
	private pointBody = (
		startRowIndex: number,
		endRowIndex: number,
		startColIndex: number,
		endColIndex: number,
		pointedMap: any
	) => {
		const canvasContext = this.options.canvasContext
		canvasContext.beginPath()
		// 绘制table部分
		for (let i = startRowIndex; i <= endRowIndex; i++) {
			for (let j = startColIndex; j <= endColIndex; j++) {
				let cell = this.getCellInfo(i, j, true)
				if (!cell) continue
				const originPointId = cell.originPointId
				if (originPointId && pointedMap[originPointId]) {
					continue
				}
				if (originPointId) {
					pointedMap[originPointId] = true
				}
				this.pointCell(cell, undefined, undefined, i, j)
			}
		}
		canvasContext.strokeStyle = "#ccc"
		canvasContext.closePath()
		canvasContext.stroke()
	}
	private pointLeftOrder = (startRowIndex: number, endRowIndex: number, frozenRow?: boolean) => {
		const hasOrder = this.options.order
		if (!hasOrder) return
		const hasSelectedBg = this.selectedRange.length
		const vertical = this.scrollBar.getVertical()
		const canvasContext = this.options.canvasContext
		canvasContext.beginPath()
		for (let i = startRowIndex; i <= endRowIndex; i++) {
			const cell = this.getCellInfo(i, 0)
			let y = frozenRow ? cell.y : cell.y - vertical.scrollTop
			this.pointCell({
				color: '#000',
				value: i + 1,
				width: LEFT_ORDER_WIDTH,
				height: cell.height,
				style: {
					backgroundColor: hasSelectedBg && i >= this.selectedRange[0] && i <= this.selectedRange[2] ? '#E1E1E1' : '#FFFFFF'
				}
			}, 0, y)
		}
		canvasContext.strokeStyle = "#ccc"
		canvasContext.closePath()
		canvasContext.stroke()
	}
	private pointTopOrder = (startColIndex, endColIndex, frozen?: boolean) => {
		const headerOrder = this.options.headerOrder
		if (!headerOrder) return
		const hasSelectedBg = this.selectedRange.length
		const scrollLeft = this.scrollBar.getHorizontal().scrollLeft
		const canvasContext = this.options.canvasContext
		canvasContext.beginPath()
		for (let j = startColIndex; j <= endColIndex; j++) {
			const cell = this.getCellInfo(0, j)
			let x = frozen ? cell.x : cell.x - scrollLeft
			this.pointCell({
				color: '#000',
				value: numToABC(j),
				width: cell.width,
				height: HEADER_ORDER_HEIGHT,
				style: {
					backgroundColor: hasSelectedBg && j >= this.selectedRange[1] && j <= this.selectedRange[3] ? '#E1E1E1' : '#FFFFFF'
				}
			}, x, 0)
		}
		canvasContext.strokeStyle = '#ccc'
		canvasContext.closePath()
		canvasContext.stroke()
	}
	/**
     * 绘制body区域左上角冻结的空白区域
     * @param
     */
	private pointLeftTopByFrozenOnBody = () => {
        const frozenRowCount = this.frozenRowCount
        const frozenColCount = this.frozenColCount
        if (!frozenRowCount || !frozenColCount) {
            return
        }
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        for (let i = 0; i < frozenRowCount; i++) {
            for (let j = 0; j < frozenColCount; j++) {
                const cell = this.getCellInfo(i, j, true)
				cell.style = {
					backgroundColor: '#AFEEEE'
				}
				cell.width -= 1
				cell.height -= 1
                this.pointCell(cell, cell.x + 1, cell.y + 1)
            }
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    /**
     * 如果有行列标，绘制左上角空白区域
     */
    private pointLeftTopByFrozen = () => {
        if (this.options.order && this.options.headerOrder) {
            const canvasContext = this.options.canvasContext
            canvasContext.beginPath()
            const cell: any = {
                x: 0,
                y: 0,
                width: LEFT_ORDER_WIDTH,
                height: HEADER_ORDER_HEIGHT,
				style: {
					backgroundColor: '#FFFFFF'
				},
                value: ''
            }
            this.pointCell(cell, cell.x, cell.y)
            canvasContext.strokeStyle = "#ccc"
            canvasContext.closePath()
            canvasContext.stroke()
        }
    }
    private pointSelectedRange = () => {
		if (!this.selectedCell) return
        const scrollLeft = this.scrollBar.getHorizontal().scrollLeft
        const scrollTop = this.scrollBar.getVertical().scrollTop
        const frozenColX = this.calcFrozenWidth(false)
        const frozenRowY = this.calcFrozenHeight(false)
		const isInFrozenOnBody = inFrozenOnBody(this, this.selectedCell)
        if (this.selectedRange.length) {
            const selected: any = {
                x: null,
                y: null,
                width: 0,
                height: 0,
                fristCell: null
            }
            let isFrozenCol = false
            let isFrozenRow = false
            for (let i = this.selectedRange[0]; i <= this.selectedRange[2]; i++) {
                let colNum = this.selectedRange[1]
                const cell = this.getCellInfo(i, colNum)
                if (!isFrozenCol) {
                    isFrozenCol = getCellInFrozenByIndex(i, colNum, this) === 'col' || isInFrozenOnBody
                }
                if (!isFrozenRow) {
                    isFrozenRow = getCellInFrozenByIndex(i, colNum, this) === 'row'
                }
                if (cell && !this.gePointer(i, colNum)) {
                    selected.height += cell.height
                    if (selected.x === null) {
                        // 如果选中的是冻结区域不需要减去scrollLeft
                        selected.x = cell.x - (isFrozenCol ? 0 : scrollLeft)
                    }
                    if (selected.y === null) {
                        selected.y = cell.y - (isFrozenRow ? 0 : scrollTop)
                    }
                }
            }
            // 选中区域跨冻结和body，需要减去scrollTop，避免滚动时选中区域高度错误
            if (isFrozenRow) {
                selected.height -= scrollTop
                if (selected.height <= this.selectedCell.height) {
                    selected.height = this.selectedCell.height
                }
                // 选中区域超出上侧冻结区域需要隐藏 做截取操作
            } else if (selected.y < frozenRowY) {
                selected.top = false
                let cellBottomY = selected.y + selected.height
                if (selected.y - scrollTop < frozenRowY && cellBottomY >= frozenRowY) {
                    let topMore = frozenRowY - selected.y
                    let newY = selected.y + topMore
                    selected.y = newY
                    selected.height -= topMore
                } else if (cellBottomY < frozenRowY) {
                    selected.bottom = false
                }
            }

            for (let j = this.selectedRange[1]; j <= this.selectedRange[3]; j++) {
                let rowNum = this.selectedRange[0]
                const cell = this.getCellInfo(rowNum, j)
                if (cell && !this.gePointer(rowNum, j)) {
                    selected.width += cell.width
                }
            }
            // 选中区域跨冻结和body，需要减去scrollLeft，避免滚动时选中区域宽度错误
            if (isFrozenCol) {
                selected.width -= scrollLeft
                if (selected.width <= this.selectedCell.width) {
                    selected.width = this.selectedCell.width
                }
                // 选中区域超出左侧冻结区域需要隐藏 做截取操作
				// 同时保证不是body左上角冻结区域,否则选中区域被覆盖
            } else if (selected.x < frozenColX && !isInFrozenOnBody) {
                selected.left = false
                let cellRightX = selected.x + selected.width
                if (selected.x - scrollLeft < frozenColX && cellRightX >= frozenColX) {
                    let leftMore = frozenColX - selected.x
                    let newX = selected.x + leftMore
                    selected.x = newX
                    selected.width -= leftMore
                } else if (cellRightX < frozenColX) {
                    selected.right = false
                }
            }
            const canvasContext = this.options.canvasContext

            for (let i = this.selectedRange[0]; i <= this.selectedRange[2]; i++) {
                for (let j = this.selectedRange[1]; j <= this.selectedRange[3]; j++) {
                    if (i != this.selectedCell.range[0] || j != this.selectedCell.range[1]) {
                        if (!this.gePointer(i, j)) {
							const cell = this.getCellInfo(i, j)
                            let sl = scrollLeft
                            let st = scrollTop
                            let wid = cell.width
                            let hei = cell.height
                            let x = cell.x
                            let y = cell.y
                            if (getCellInFrozenByIndex(i, j, this) === 'row') {
                                st = 0;
                            } else {
                                y -= st
                                let cellBottomY = cell.y + cell.height
                                // 往上滚动，当前选中的单元格超过冻结区域时不需要绘制
                                if (cell.y + hei - st <= frozenRowY) {
                                    continue;
                                    // 往上滚动，卡在冻结区域和body各一半时需要重新计算选中的单元格高度和当前单元格y坐标
                                } else if (cell.y - st < frozenRowY && cellBottomY - st > frozenRowY) {
                                    y = frozenRowY
                                    hei = cellBottomY - st - frozenRowY
                                }
                            }
                            if (getCellInFrozenByIndex(i, j, this) === 'col') {
                                sl = 0
                            } else {
                                x -= sl
                                let cellRightX = cell.x + cell.width
                                // 往左滚动，当前选中的单元格超过冻结区域时不需要绘制
                                if (cell.x + wid - sl <= frozenColX) {
                                    continue;
                                    // 往左滚动，卡在冻结区域和body各一半时需要重新计算选中的单元格宽度和当前单元格x坐标
                                } else if (cell.x - sl < frozenColX && cellRightX - sl > frozenColX) {
                                    x = frozenColX
                                    wid = cellRightX - sl - frozenColX
                                }
                            }
                            this.paintCellBgColor(
                                x,
                                y,
                                wid,
                                hei,
                                null,
                                'rgba(0, 0, 0, 0.2)'
                            )
                        }
                    }
                }
            }
            // 滚动超出左侧 或者 上方时选中区域不需要绘制
            if (selected.right === false || selected.bottom === false) {
                return
            }
            // 绘制线段
            canvasContext.beginPath()
            canvasContext.lineWidth = 2
            canvasContext.strokeStyle = BORDER_COLOR

            // 选中区域边框超出上方冻结区域时 不需要绘制
            if (selected.top !== false) {
                canvasContext.moveTo(selected.x - 1, selected.y)
                canvasContext.lineTo(selected.x + selected.width + 2, selected.y)
            }

            canvasContext.moveTo(selected.x - 1, selected.y + selected.height + 1)
            canvasContext.lineTo(selected.x + selected.width - 3, selected.y + selected.height + 1)

            if (selected.left !== false) {
                canvasContext.moveTo(selected.x, selected.y)
                canvasContext.lineTo(selected.x, selected.y + selected.height)
            }

            canvasContext.moveTo(selected.x + selected.width + 1, selected.y)
            canvasContext.lineTo(selected.x + selected.width + 1, selected.y + selected.height - 3)
            canvasContext.stroke()

            canvasContext.fillStyle = BORDER_COLOR
            canvasContext.fillRect(selected.x + selected.width - 2, selected.y + selected.height - 2, 5, 5)

            canvasContext.closePath()
            canvasContext.lineWidth = 1
        }
    }
	/**
     * 绘制冻结行
     */
	private pointFrozenRow = (startColIndex, endColIndex, pointedMap) => {
        const isFrozenRowCount = this.frozenRowCount > 0
        if (!isFrozenRowCount) return
        const canvasContext = this.options.canvasContext
        // 记住冻结行到达的最大Y坐标，选中区域时用来判断当前鼠标的坐标是否在冻结区域
        let maxY = 0;
        canvasContext.beginPath()
        // 绘制冻结行头
        for (let i = 0; i < this.frozenRowCount; i++) {
            for (let j = startColIndex; j <= endColIndex; j++) {
                let cell = this.getCellInfo(i, j, true)
                // 当前单元格已经被绘制过就跳出
				if (!cell) continue
				const originPointId = cell.originPointId
				if (originPointId && pointedMap[originPointId]) {
					continue
				}
				if (originPointId) {
					pointedMap[originPointId] = true
				}
				cell.style = cell.style ? Object.assign({backgroundColor: '#E1FFFF'}, cell.style) : {backgroundColor: '#E1FFFF'}
                // cell.backgroundColor = cell.backgroundColor || '#E1FFFF'
                this.pointCell(cell, undefined, cell.y, i, j)
                // 冻结的最后一行，更新maxY
                if (i === this.frozenRowCount - 1) {
                    if (cell.y + cell.height > maxY) {
                        maxY = cell.y + cell.height
                    }
                }
            }
        }
        this.frozenInfo.row.endY = maxY
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    private pointFrozenCol = (startRowIndex, endRowIndex, pointedMap: any) => {
        const isFrozenColCount = this.frozenColCount > 0
        if (!isFrozenColCount) return
        const horizontal = this.scrollBar.getHorizontal()
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        // 记住冻结列到达的最大X坐标，选中区域时用来判断当前鼠标的坐标是否在冻结区域
        let maxX = 0;
        canvasContext.beginPath()
        // 绘制冻结行头
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            for (let j = 0; j < this.frozenColCount; j++) {
                let cell = this.getCellInfo(i, j, true)
                // 当前单元格已经被绘制过就跳出
                if (!cell) continue
				const originPointId = cell.originPointId
				if (originPointId && pointedMap[originPointId]) {
					continue
				}
				if (originPointId) {
					pointedMap[originPointId] = true
				}
                let x = cell.x
                let y = cell.y - vertical.scrollTop
                if (!isFrozenColCount) {
                    x -= horizontal.scrollLeft
                }
				cell.style = cell.style ? Object.assign({backgroundColor: '#E1FFFF'}, cell.style) : {backgroundColor: '#E1FFFF'}
                this.pointCell(cell, cell.x, y, i, j)
                // 冻结的最后一行，更新maxY
                if (j === this.frozenColCount - 1) {
                    if (cell.x + cell.width > maxX) {
                        maxX = cell.x + cell.width
                    }
                }
            }
        }
        this.frozenInfo.col.endX = maxX
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
	private pointCell = (cell: any, x: number, y: number, row?: number, col?: number) => {
        const scrollLeft = this.scrollBar.getHorizontal().scrollLeft
        const scrollTop = this.scrollBar.getVertical().scrollTop
        const canvasContext = this.options.canvasContext
        const lineX = x !== undefined ? x : cell.x - scrollLeft
        const lineY = y !== undefined ? y : cell.y - scrollTop
        canvasContext.strokeStyle = '#ccc'
		// 下
        canvasContext.moveTo(lineX + 0.5, lineY + cell.height + 0.5)
        canvasContext.lineTo(lineX + cell.width + 0.5, lineY + cell.height + 0.5)
		// 左
        canvasContext.moveTo(lineX + cell.width + 0.5, lineY + 0.5)
        canvasContext.lineTo(lineX + cell.width + 0.5, lineY + cell.height + 0.5)

        // 单元格背景颜色
        this.paintCellBgColor(lineX, lineY, cell.width, cell.height, cell.style ? cell.style.backgroundColor || '#FFFFFF' : '#FFFFFF')
		let value = cell.value
        if (value) {
            let fontX = x !== undefined ? x + 4 : cell.x - scrollLeft + 4
            let fontY = y !== undefined ? y + (cell.height / 2) + (this.font / 2) : cell.y - scrollTop + (cell.height / 2) + (this.font / 2)
            // 字体
            canvasContext.fillStyle = cell.style && cell.style.color || '#000'
			if (cell.style && cell.style.fontSize) {
				canvasContext.font = `
					${cell.style.fontStyle ? cell.style.fontStyle : 'normal'} ${cell.style.fontVariant ? cell.style.fontVariant : 'normal'} ${cell.style.fontWeight ? cell.style.fontWeight : 'normal'} ${pxToNum(cell.style.fontSize)}px ${cell.style.fontFamily ? cell.style.fontFamily : FONT_FAMILY}
				`
			}
			if (cell.type && cell.format && this.formatterInstance[cell.type]) {
				value = this.formatterInstance[cell.type](value, cell.format)
			}
            canvasContext.fillText(value, fontX, fontY)
			if (cell.style && cell.style.fontSize) {
				canvasContext.font = `${this.font}px ${FONT_FAMILY}`
			}
        }
    }
	// 绘制背景颜色 context: CanvasRenderingContext2D
    private paintCellBgColor = (x: number, y: number, width: number, height: number, fillStyle: string, customStyle?: string) => {
        const canvasContext = this.options.canvasContext
        canvasContext.fillStyle = customStyle || fillStyle
        canvasContext.fillRect(x, y, width, height)
    }
	// 绘制 top 选中border
	private pointCellTopBorder = () => {
        const scrollLeft = this.scrollBar.getHorizontal().scrollLeft
		const canvasContext = this.options.canvasContext
		const selectedRange = this.selectedRange
        canvasContext.lineWidth = 2
        canvasContext.beginPath()
		// 下
		for (let j = selectedRange[1]; j <= selectedRange[3]; j++) {
			let x = this.colDataMap[j].x - scrollLeft
			let y = this.yOffset
			canvasContext.moveTo(x - 0.5, this.yOffset + 0.5)
			canvasContext.lineTo(x + this.colDataMap[j].width + 0.5, y+ 0.5)
		}
        canvasContext.strokeStyle = BORDER_COLOR
        canvasContext.closePath()
        canvasContext.stroke()
        canvasContext.lineWidth = 1
	}

	// 绘制 left 选中border
	private pointCellLeftBorder = () => {
        const scrollTop = this.scrollBar.getVertical().scrollTop
		const canvasContext = this.options.canvasContext
		const selectedRange = this.selectedRange
        canvasContext.lineWidth = 2
        canvasContext.beginPath()
        // 左边
		for (let i = selectedRange[0]; i <= selectedRange[2]; i++) {
            let y = this.rowDataMap[i].y - scrollTop
			let x = this.xOffset
            canvasContext.moveTo(x + 0.5, y + 0.5)
            canvasContext.lineTo(x + 0.5, y + this.rowDataMap[i].height + 0.5)
		}
        canvasContext.strokeStyle = BORDER_COLOR
        canvasContext.closePath()
        canvasContext.stroke()
        canvasContext.lineWidth = 1
	}
}