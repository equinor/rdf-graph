import { Separator_1 } from './symbols/separator-1';
import { Valve_1 } from './symbols/valve-1';
import { Valve_3Way_1 } from './symbols/valve-3Way-1';
import { NodeSymbolTemplate } from './types/NodeSymbol';

export enum SymbolKey {
	Valve_1 = 'Valve_1',
	Valve_3Way_1 = 'Valve_3Way_1',
	Separator_1 = 'Separator_1',
}

export const SymbolLibrary: Record<keyof typeof SymbolKey, NodeSymbolTemplate> = {
	Valve_1: Valve_1,
	Separator_1: Separator_1,
	Valve_3Way_1: Valve_3Way_1,
};
