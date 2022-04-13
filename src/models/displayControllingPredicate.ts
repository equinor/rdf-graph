export class DisplayControllingPredicate {
	constructor(predicate: string, location: string, keepNode: boolean, mapping: (originalObject: string | undefined) => string | undefined) {
		this.predicate = predicate;
		this.dataProperty = location;
		this.keepNode = keepNode;
		this.mapping = mapping;
	}

	predicate: string;
	dataProperty: string;
	keepNode: boolean;
	mapping: (originalObject: string | undefined) => string | undefined;
}
