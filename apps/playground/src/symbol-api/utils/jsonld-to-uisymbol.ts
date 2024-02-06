import { UiSymbol } from '@equinor/rdf-graph';

export const jsonLdResponseToUiSymbol = (response: object): UiSymbol[] => {
	if (!response) {
		throw new Error('jsonLdResponseToDto: response is null or undefined');
	}

	if ('@graph' in response && Array.isArray(response['@graph'])) {
		// Multiple symbols
		return response['@graph'].map(jsonLdSymbolToDto);
	} else if ('@id' in response) {
		// Single symbol
		return [jsonLdSymbolToDto(response)];
	}

	return [];
};

function jsonLdSymbolToDto(obj: object): UiSymbol {
	const identifier = valueOrDefault<string>(obj, ['dc:identifier']);
	if (!identifier) throw new Error('jsonLdSymbolToDto: identifier is null or undefined');

	const width = parseInt(valueOrDefault<string>(obj, ['sym:width']));
	const height = parseInt(valueOrDefault<string>(obj, ['sym:height']));
	const geometry = valueOrDefault<object[]>(obj, ['sym:hasShape', 'sym:hasSerialization']).map(
		(o) => valueOrDefault<string>(o, ['@value'])
	)[0];
	const svg = pathToSvgString(width, height, geometry);

	const result: UiSymbol = {
		id: identifier,
		svg,
		geometry,
		width,
		height,
		connectors: toArray(valueOrDefault<object[]>(obj, ['sym:hasConnectionPoint'], []), (o) => ({
			id: valueOrDefault<string>(o, ['dc:identifier']),
			position: {
				x: parseFloat(valueOrDefault<string>(o, ['sym:positionX'])),
				y: parseFloat(valueOrDefault<string>(o, ['sym:positionY'])),
			},
			direction: parseFloat(valueOrDefault<string>(o, ['sym:connectorDirection'])),
		})),
	};

	return result;
}

function toArray<T>(obj: object, fn: (o: object) => T): T[] {
	return Array.isArray(obj) ? obj.map(fn) : [fn(obj)];
}

function valueOrDefault<T>(
	obj: object,
	path: string[],
	useDefault?: T | null,
	defaultIsUndefined = false
): T {
	let current = obj;
	let result = undefined;

	for (const key of path) {
		if (current && key in current) {
			current = current[key as keyof typeof current];
			result = current;
		}
	}

	if (result === undefined || result === null) {
		if (useDefault !== undefined || defaultIsUndefined) {
			return useDefault!;
		}

		throw new Error('Did not find value for path: ' + path.join('.'));
	}

	return result as T;
}
function pathToSvgString(width: number, height: number, geometry: string): string {
	return `<svg width="${width}" height="${height}" fill="black" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"> <path d="${geometry}"/> </svg>`;
}
