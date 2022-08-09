import { Separator_1 } from './symbols/separator-1';
import { Valve_1 } from './symbols/valve-1';
import { Valve_3Way_1 } from './symbols/valve-3Way-1';
import { PSV_C } from './symbols/psv-c';
import { LV_O } from './symbols/lv-o';
import { VG_C } from './symbols/vg-c';
import { VG_O } from './symbols/vg-o';
import { Vessel_4 } from './symbols/vessel-4';
import { Pump_2 } from './symbols/pump-2';
import { NodeSymbolTemplate } from './types/NodeSymbol';

export enum SymbolKey {
	Valve_1 = 'Valve_1',
	Valve_3Way_1 = 'Valve_3Way_1',
	Separator_1 = 'Separator_1',
	PSV_C = 'PSV_C',
	LV_O = 'LV_O',
	VG_C = 'VG_C',
	VG_O = 'VG_O',
	Vessel_4 = 'VS_4',
	Pump_2 = 'Pump_2',
}
export enum SimpleSymbolKey {
	Ellipse = 'Ellipse',
	Rectangle = 'Rectangle',
}

export const SymbolLibrary: Record<keyof typeof SymbolKey, NodeSymbolTemplate> = {
	Valve_1: Valve_1,
	Separator_1: Separator_1,
	Valve_3Way_1: Valve_3Way_1,
	PSV_C: PSV_C,
	LV_O: LV_O,
	VG_C: VG_C,
	VG_O: VG_O,
	Vessel_4: Vessel_4,
	Pump_2: Pump_2,
};
