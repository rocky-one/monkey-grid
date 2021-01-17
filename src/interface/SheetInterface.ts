import ScrollBar from "scrollBar/ScrollBar";

export interface SheetOptions {
    name: string,
    rowCount: number,
    colCount: number,
    layout: any,
    canvas: HTMLCanvasElement,
    canvasContext: any,
    clientHeight: number,
    clientWidth: number,
    order?: boolean,
    headerOrder?: boolean
    xOffset?: number,
    yOffset?: number,
    ratio: number
}

export interface PointRange {
    startRowIndex: number;
    endRowIndex: number;
    startColIndex: number;
    endColIndex: number;
}