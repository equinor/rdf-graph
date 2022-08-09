import go from 'gojs';
import { NodeUiItemCategory } from '../types';
import { createDefaultItemTemplate, createPositionPortItemTemplate } from './position-port-item-template';

export let itemTemplateMap = new go.Map<string, go.Panel>()
	.add(NodeUiItemCategory.Default, createDefaultItemTemplate())
	.add(NodeUiItemCategory.PositionPort, createPositionPortItemTemplate())
	.add(NodeUiItemCategory.DirectionPort, createPositionPortItemTemplate());
