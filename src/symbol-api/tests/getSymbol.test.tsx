import { getConnectorSymbolAdvanced } from '../getConnectorSymbol';

describe('Symbol stuff', () => {
	test('Symbol', async () => {
		const sym = getConnectorSymbolAdvanced('PP007A', { rotation: 0 });

		sym && sym.connectors.forEach((_c) => {});
	});
});
