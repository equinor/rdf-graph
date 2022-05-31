export function setEquals<T>(xs: T[], ys: T[]) {
	return Array.isArray(xs) && Array.isArray(ys) && xs.length === ys.length && xs.every((x) => ys.find((y) => x === y));
}
