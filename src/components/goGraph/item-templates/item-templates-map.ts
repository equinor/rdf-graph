import go from 'gojs';
import { NodeUiItemCategory } from '../types';
import { createPositionPortItemTemplate } from './position-port-item-template';

export let itemTemplateMap = new go.Map<string, go.Panel>().add(NodeUiItemCategory.PositionPort, createPositionPortItemTemplate());
