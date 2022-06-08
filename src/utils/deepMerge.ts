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
				if (key === 'rdfData') {
					output[key] = mergeData(source[key], target[key]);
				} else {
					output[key] = source[key].concat(target[key]);
				}
			} else {
				Object.assign(output, { [key]: source[key] });
			}
		});
	}
	return output;
}

const mergeData = (xs: any, ys: any) => {
	const outArray: any[] = [];

	ys.forEach((x: any) => {
		const y = xs.find((y: any) => x.key === y.key);
		if (y) {
			outArray.push({ key: y.key, value: y.value });
		} else {
			outArray.push({ key: x.key, value: x.value });
		}
	});

	xs.forEach((y: any) => {
		const x = ys.find((x: any) => y.key === x.key);
		if (!x) {
			outArray.push({ key: y.key, value: y.value });
		}
	});

	return outArray;
};
