export class UiEdge {
	constructor(from: string, to: string | undefined) {
		this.from = from;
		this.to = to;
	}

	from: string;
	to: string | undefined;
}
