import go from 'gojs';
import { NodeItemType } from '../types';
import { createSymbolPortItemTemplate } from './symbol-port-item-template';

export let itemTemplateMap = new go.Map<string, go.Panel>().add(NodeItemType.SvgSymbolPort, createSymbolPortItemTemplate());
