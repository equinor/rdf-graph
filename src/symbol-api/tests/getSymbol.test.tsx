import { getSymbol } from '../getSymbol';
import { SymbolKey } from '../symbol-library';

describe('Symbol stuff', () => {
	test('Symbol', async () => {
		const sym = getSymbol(SymbolKey.Separator_1, { rotation: 0 });

		sym &&
			sym.connectors.forEach((c) => {
				console.log(`${c.id}: x=${c.point.x} | y=${c.point.y}`);
			});
	});
});
