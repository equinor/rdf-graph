import { getSymbol } from '../getSymbol';
import { SymbolKey } from '../symbol-library';

describe('Symbol stuff', () => {
	test('Symbol', async () => {
		console.log('yazzy');

		const sym = getSymbol(SymbolKey.Separator_1, { rotation: 90 });

		console.log(sym);

		sym.connectors.forEach((c) => {
			console.log(`${c.id}: x=${c.point.x} | y=${c.point.y}`);
		});

		//expect(elementA.data['color']).toBe('green');
	});
});
