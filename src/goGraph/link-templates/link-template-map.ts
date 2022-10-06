import go from 'gojs';
import { createDefaultLinkTemplate } from './default-link-template';

export const linkTemplateMap = new go.Map<string, go.Link>().add('', createDefaultLinkTemplate());
