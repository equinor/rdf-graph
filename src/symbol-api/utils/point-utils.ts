import { Point } from '../types/Point';

export function rotatePoint(point: Point, rotation: number): Point {
	const theta = (rotation * Math.PI) / 180;
	return {
		x: point.x * Math.cos(theta) - point.y * Math.sin(theta),
		y: point.y * Math.cos(theta) + point.x * Math.sin(theta),
	};
}

/** Converts a Point with origo TopLeft to a point with origo CenterCenter */
export function pointToCenterCenter(point: Point, xRng: number, yRng: number): Point {
	return {
		x: -xRng / 2 + point.x,
		y: yRng / 2 - point.y,
	};
}
