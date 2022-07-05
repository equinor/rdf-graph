/** Map of properties to GoJS data properties */
export const propMap: Record<string, string> = {
	shape: 'figure',
	rotation: 'angle',
	label: 'label',
} as const;

/** Map of shape properties to GoJs shapes
 *
 * See https://gojs.net/latest/samples/shapes.html */
export const shapeMap: Record<string, string> = {
	rectangle: 'Rectangle',
	square: 'Square',
	roundedRectangle: 'RoundedRectangle',
	Ellipse: 'Ellipse',
	circle: 'Circle',
	triangle: 'Triangle',
	diamond: 'Diamond',
	// "": "TriangleRight",
	// "": "TriangleDown",
	// "": "TriangleLeft",
	// "": "TriangleUp",
} as const;
