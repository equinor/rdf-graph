import { Some, Option, Result, Ok, Err } from '@sniptt/monads';

type DummyState = {
	stuff: string[];
};

function dummy2(state: DummyState, payload: string[]): Option<DummyState> {
	return payload.reduce((acc, p) => {
		return acc
			.andThen(jazzy('A'))
			.andThen(jazzy('P:' + p))
			.andThen(jazzy('B'));
	}, Some(state));
}

function jazzy(str: string) {
	return (val: DummyState) => {
		return Some<DummyState>({ stuff: [...val.stuff, str] });
	};
}

function dummy3(state: DummyState, payload: string[]): Result<DummyState, string> {
	return payload.reduce<Result<DummyState, string>>((acc, p) => {
		return acc
			.andThen(jazzyRes('A'))
			.andThen(jazzyRes('P:' + p))
			.andThen(jazzyRes('B'));
	}, Ok(state));
}

function jazzyRes(str: string): (val: DummyState) => Result<DummyState, string> {
	return (val: DummyState) => {
		if (str.includes('fail')) {
			return Err('Got failed... in string = ' + str);
		}
		return Ok<DummyState>({ stuff: [...val.stuff, str] });
	};
}

test('Monads Option<T>', () => {
	const res = dummy2({ stuff: ['Jay'] }, ['1', '2', '3']);

	console.log(
		res.match({
			some: (v) => JSON.stringify(v),
			none: 'Error... Res was None',
		})
	);

	expect(res.isSome()).equal(true);
});

test('Monads Result<T, E>', () => {
	const res = dummy3({ stuff: ['Jay'] }, ['1', '2', '3', ' This will fail big!']);

	console.log(
		res.match({
			ok: (v) => JSON.stringify(v),
			err: (v) => 'Error msg (expected): ' + v,
		})
	);

	expect(res.isErr()).equal(true);
});
