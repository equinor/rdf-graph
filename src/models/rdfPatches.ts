import { RdfPatch } from './rdfPatch';

export class RdfPatches {
	currentPatch: number;
	renderedPatch: number;
	patches: RdfPatch[];

	constructor() {
		this.currentPatch = 0;
		this.renderedPatch = 0;
		this.patches = [];
	}

	add(patch: RdfPatch) {
		this.patches.push(patch);
		this.currentPatch++;
	}
}
