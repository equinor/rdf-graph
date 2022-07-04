import go from 'gojs';
import { MultiArrowLink } from './MultiArrowLink';

export function createMultiArrowLinkTemplate(): go.Link {
	const $ = go.GraphObject.make;
	return $(
		MultiArrowLink,
		{ routing: go.Link.AvoidsNodes, curve: go.Link.JumpOver }, // link route should avoid nodes
		$(go.Shape, { isPanelMain: true }, new go.Binding('fill', 'color'))
	);
}
