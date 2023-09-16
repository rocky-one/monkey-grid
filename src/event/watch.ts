
export default function watch(obj: any, key: string, cb: Function) {
	let value = obj[key];
	Object.defineProperty(obj, key, {
		get: function () {
			return value
		},
		set: function (val) {
			if (value !== val) {
				value = val
				cb && cb()
			}
		},
	});
}