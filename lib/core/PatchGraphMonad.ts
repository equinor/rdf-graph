import { PatchGraphResult } from './types/types';

export type BindFunction = (state: PatchGraphResult) => PatchGraphMonad;

export class PatchGraphMonad {
	constructor(private readonly state: PatchGraphResult) {}

	bind(f: BindFunction): PatchGraphMonad {
		return f(this.state);
	}

	getState() {
		return this.state;
	}
}
