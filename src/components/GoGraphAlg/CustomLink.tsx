import * as go from 'gojs';

class CustomLink extends go.Link {
	findSidePortIndexAndCount(node: any, port: any) {
		const nodedata = node.data;
		let len;
		if (nodedata !== null) {
			const portdata = port.data;
			const side = port._side;
			const arr = nodedata[side + 'Array'];
			len = arr.length;
			for (let i = 0; i < len; i++) {
				if (arr[i] === portdata) return [i, len];
			}
		}
		return [-1, len];
	}

	computeEndSegmentLength(node: any, port: any, spot: any, from: any) {
		const esl = super.computeEndSegmentLength(node, port, spot, from);
		const other = this.getOtherPort(port);
		if (port !== null && other !== null) {
			const thispt = port.getDocumentPoint(this.computeSpot(from));
			const otherpt = other.getDocumentPoint(this.computeSpot(!from));
			if (Math.abs(thispt.x - otherpt.x) > 20 || Math.abs(thispt.y - otherpt.y) > 20) {
				const info = this.findSidePortIndexAndCount(node, port);
				const idx = info[0];
				const count = info[1];
				if (port._side === 'top' || port._side === 'bottom') {
					if (otherpt.x < thispt.x) {
						return esl + 4 + idx * 8;
					} else {
						return esl + (count - idx - 1) * 8;
					}
				} else {
					// left or right
					if (otherpt.y < thispt.y) {
						return esl + 4 + idx * 8;
					} else {
						return esl + (count - idx - 1) * 8;
					}
				}
			}
		}
		return esl;
	}

	hasCurviness() {
		if (isNaN(this.curviness)) return true;
		return super.hasCurviness();
	}

	computeCurviness() {
		if (isNaN(this.curviness)) {
			const fromnode = this.fromNode;
			const fromport: any = this.fromPort;
			const fromspot = this.computeSpot(true);
			const frompt = fromport.getDocumentPoint(fromspot);
			const tonode = this.toNode;
			const toport: any = this.toPort;
			const tospot = this.computeSpot(false);
			const topt = toport.getDocumentPoint(tospot);
			if (Math.abs(frompt.x - topt.x) > 20 || Math.abs(frompt.y - topt.y) > 20) {
				if (
					(fromspot.equals(go.Spot.Left) || fromspot.equals(go.Spot.Right)) &&
					(tospot.equals(go.Spot.Left) || tospot.equals(go.Spot.Right))
				) {
					const fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
					const toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
					const c = (fromseglen - toseglen) / 2;
					if (frompt.x + fromseglen >= topt.x - toseglen) {
						if (frompt.y < topt.y) return c;
						if (frompt.y > topt.y) return -c;
					}
				} else if (
					(fromspot.equals(go.Spot.Top) || fromspot.equals(go.Spot.Bottom)) &&
					(tospot.equals(go.Spot.Top) || tospot.equals(go.Spot.Bottom))
				) {
					const fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
					const toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
					const c = (fromseglen - toseglen) / 2;
					if (frompt.x + fromseglen >= topt.x - toseglen) {
						if (frompt.y < topt.y) return c;
						if (frompt.y > topt.y) return -c;
					}
				}
			}
		}
		return super.computeCurviness();
	}
}

export { CustomLink };
