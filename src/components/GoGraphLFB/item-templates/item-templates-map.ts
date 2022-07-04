import go from 'gojs';
import { createSymbolPortItemTemplate } from './symbol-port-item-template';

export let itemTemplateMap = new go.Map<string, go.Panel>().add('symbolPort', createSymbolPortItemTemplate());
