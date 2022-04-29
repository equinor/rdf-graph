import { Point } from '../types/Point';

/** Rotates a Point (x,y) around orgio  */
export function rotatePoint(point: Point, rotation: number): Point {
	const theta = (rotation * Math.PI) / 180;
	return new Point(point.x * Math.cos(theta) - point.y * Math.sin(theta), point.y * Math.cos(theta) + point.x * Math.sin(theta));
}

/** Converts a Point with origo TopLeft to a point with origo CenterCenter */
export function pointToCenterCenter(point: Point, xRng: number, yRng: number): Point {
	return new Point(-xRng / 2 + point.x, -yRng / 2 + point.y);
}
