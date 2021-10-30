import dayjs from 'dayjs'

type Options = {

}

class Formatter {
	constructor(options) {
		this.options = options;
	}
	options: Options

	// ##.##
	// #,###.#
	number = (value: number, formatCode: string) => {
		if (typeof value !== 'number') return value
		let formatArr = formatCode.split('.')
		// 保留小数点位数长度
		const decimalLen = formatArr.length > 1 ? formatArr[1].length : 0
		let num: number | string = parseFloat(value.toFixed(decimalLen))
		let hasThousand = formatCode.indexOf(',') > -1
		if (hasThousand) {
			num = num.toLocaleString()
		}
		return num
	}
	date = (value: string, formatCode: string) => {
		return dayjs(value).format(formatCode)
	}
	transformValue = (value: string, type: string) => {
		if (type === 'number') {
			return parseFloat(value)
		}
		return value
	}
}

export default Formatter