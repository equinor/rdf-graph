// Produce a Geometry that includes an arrowhead at the end of each segment.

import go from 'gojs';

// This only works with orthogonal non-Bezier routing.
export class MultiArrowLink extends go.Link {
	constructor() {
		super();
		this.routing = go.Link.Orthogonal;
	}

	// produce a Geometry from the Link's route
	makeGeometry() {
		// get the Geometry created by the standard behavior
		const geo = super.makeGeometry();
		if (geo.type !== go.Geometry.Path || geo.figures.length === 0) return geo;
		const mainfig = geo.figures.elt(0); // assume there's just one PathFigure
		const mainsegs = mainfig.segments;

		const arrowLen = 8; // length for each arrowhead
		const arrowWid = 3; // actually half-width of each arrowhead
		let fx = mainfig.startX;
		let fy = mainfig.startY;
		for (let i = 0; i < mainsegs.length - 1; i++) {
			// NOTE: mainsegs.length - 1 to not include last arrow!!!
			const a = mainsegs.elt(i);
			// assume each arrowhead is a simple triangle
			const ax = a.endX;
			const ay = a.endY;
			let bx = ax;
			let by = ay;
			let cx = ax;
			let cy = ay;
			if (fx < ax - arrowLen) {
				bx -= arrowLen;
				by += arrowWid;
				cx -= arrowLen;
				cy -= arrowWid;
			} else if (fx > ax + arrowLen) {
				bx += arrowLen;
				by += arrowWid;
				cx += arrowLen;
				cy -= arrowWid;
			} else if (fy < ay - arrowLen) {
				bx -= arrowWid;
				by -= arrowLen;
				cx += arrowWid;
				cy -= arrowLen;
			} else if (fy > ay + arrowLen) {
				bx -= arrowWid;
				by += arrowLen;
				cx += arrowWid;
				cy += arrowLen;
			}
			geo.add(
				new go.PathFigure(ax, ay, true)
					.add(new go.PathSegment(go.PathSegment.Line, bx, by))
					.add(new go.PathSegment(go.PathSegment.Line, cx, cy).close())
			);
			fx = ax;
			fy = ay;
		}

		return geo;
	}
}
// end of MultiArrowLink class
