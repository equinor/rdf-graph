export class TwoWayMap {
	reverseMap: { [key: string]: string };

	constructor(readonly dict: { [key: string]: string }) {
		this.reverseMap = {};
		for (const key in dict) {
			const value = dict[key];
			this.reverseMap[value] = key;
		}
	}

	get(key: string) {
		return this.dict[key];
	}
	revGet(key: string) {
		return this.reverseMap[key];
	}
}
