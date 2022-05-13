export function arrayEquals<T>(a: T[], b: T[]) {
	return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}
