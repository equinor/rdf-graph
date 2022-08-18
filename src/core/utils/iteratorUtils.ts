export function* flatMap<T, R>(i: Iterable<T>, c: (a: T) => Iterable<R>) {
	for (const e of i) yield* c(e);
}

export function* flat<T>(i: Iterable<Iterable<T> | T[]>): Iterable<T> {
	for (const e of i) yield* e;
}

export function* unique<T>(ts: Iterable<T>): Iterable<T> {
	const set = new Set<T>();
	for (const t of ts) {
		if (set.has(t)) continue;
		set.add(t);
		yield t;
	}
}
