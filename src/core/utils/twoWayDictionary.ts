export class TwoWayMap {
	reverseMap: { [key: string]: string };

	constructor(readonly dict: { [key: string]: string }) {
		this.reverseMap = {};
		for (const key in dict) {
			const value = dict[key];
			this.reverseMap[value] = key;
		}
	}

	keys() {
		return Object.keys(this.dict);
	}

	values() {
		return Object.keys(this.reverseMap);
	}

	includes(key: string) {
		return this.dict.hasOwnProperty(key);
	}

	revIncludes(key: string) {
		return this.reverseMap.hasOwnProperty(key);
	}
	get(key: string) {
		return this.dict[key];
	}

	revGet(key: string) {
		return this.reverseMap[key];
	}
}
