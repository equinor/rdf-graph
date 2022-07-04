import { NodeSymbolTemplate } from './types/NodeSymbol';
import { Pump1 } from './symbols/Pump1';
import { Valve_gate_o } from './symbols/Valve_gate_o';
import { Pump2 } from './symbols/Pump2';

export enum SymbolKey {
	Pump1 = 'Pump1',
	Pump2 = 'Pump2',
	Valve_gate_o = 'Valve_gate_o',
}

export const SymbolLibrary: Record<keyof typeof SymbolKey, NodeSymbolTemplate> = {
	Pump1: Pump1,
	Valve_gate_o: Valve_gate_o,
	Pump2: Pump2,
};
