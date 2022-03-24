export const EdgeIdDelimiter = '€';

export class Edge {
	constructor(from: string, to: string, type: string) {
		this.from = from;
		this.to = to;
		this.type = type;
	}

	from: string;
	to: string | undefined;
	type: string;

	id = () => this.from + EdgeIdDelimiter + this.to + EdgeIdDelimiter + this.type;
}
