<h1 align="center" size=24>monkey-grid</h1>

<div align="center" size=14>monkey-grid致力打造一款web端excel(持续迭代中)。</div>
</br>
</br>

## Features
- 多维数据展示
- 合并单元格
- 冻结行列设置
- 单元格自定义样式
- 数值、日期类型

## Install

```npm install monkey-grid```

```yarn add monkey-grid```

## Usage

```
import MonkeyGrid from "monkey-grid";

// 创建实例
const MG = new MonkeyGrid({
    container: document.getElementById("gridContainer"),
    order: true,
    headerOrder: true,
});

// 添加一个sheet
const sheet = MG.addSheet({
    name: "sheetName",
    rowCount: 200,
    colCount: 20
});

// 往sheet中添加一个表格
sheet.addTable("tableName", 0, 0, [
    [
        {
            value: '1'
        },
        {
            value: '2'
        }
    ],
    [
        {
            value: '3'
        },
        {
            value: '4'
        }
    ]
]);

```