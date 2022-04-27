/**  */
export function stringToSvgElement(svg: string): SVGSVGElement {
	const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
	return doc.lastChild as SVGSVGElement;
}
