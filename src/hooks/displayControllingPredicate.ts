export class DisplayControllingPredicate {
	constructor(
		predicate: string,
		location: string,
		keepNode: boolean,
		mapping: (originalObject: string | undefined) => string | undefined,
		fallback: (originalSubject: string | undefined) => string | undefined
	) {
		this.predicate = predicate;
		this.location = location;
		this.keepNode = keepNode;
		this.mapping = mapping;
		this.fallback = fallback;
	}

	predicate: string;
	location: string;
	keepNode: boolean;
	mapping: (originalObject: string | undefined) => string | undefined;
	fallback: (originalSubject: string | undefined) => string | undefined;
}
