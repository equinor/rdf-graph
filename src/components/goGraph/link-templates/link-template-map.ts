import go from 'gojs';
import { createDefaultLinkTemplate } from './default-link-template';
import { createMultiArrowLinkTemplate } from './multi-arrow-link-template';

export const linkTemplateMap = new go.Map<string, go.Link>().add('', createDefaultLinkTemplate()).add('multiArrow', createMultiArrowLinkTemplate());
