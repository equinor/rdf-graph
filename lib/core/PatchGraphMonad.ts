import { PatchGraphResult } from './types/core';

export type BindFunction = (state: PatchGraphResult) => PatchGraphMonad;

export class PatchGraphMonad {
	constructor(private readonly state: PatchGraphResult) {}

	bind(f: BindFunction): PatchGraphMonad {
		return f(this.state);
	}

	bindMany(fs: BindFunction[]): PatchGraphMonad {
		return fs.reduce((acc, f) => acc.bind(f), new PatchGraphMonad(this.state));
	}

	getState() {
		return this.state;
	}
}
