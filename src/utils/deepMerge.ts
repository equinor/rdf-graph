function isObject(item: any) {
	return item && typeof item === 'object' && !Array.isArray(item);
}

function isArray(item: any) {
	return Array.isArray(item);
}

export default function deepMerge(target: any, source: any) {
	let output = Object.assign({}, target);
	if (isObject(target) && isObject(source)) {
		Object.keys(source).forEach((key) => {
			if (isObject(source[key])) {
				if (!(key in target)) {
					Object.assign(output, { [key]: source[key] });
				} else {
					output[key] = deepMerge(target[key], source[key]);
				}
			} else if (isArray(source[key])) {
				output[key] = target[key].concat(source[key]);
			} else {
				Object.assign(output, { [key]: source[key] });
			}
		});
	}
	return output;
}
