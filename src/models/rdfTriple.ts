export class RdfTriple {
	constructor(readonly rdfSubject: string, readonly rdfPredicate: string, readonly rdfObject: string, readonly data: any = {}) {}
}
