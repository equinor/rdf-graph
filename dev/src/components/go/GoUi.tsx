import { EdsProvider, Radio } from '@equinor/eds-core-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RdfGraphDiagram } from '../../../../lib/go/RdfGraphDiagram';

import { RdfPatch } from '../../../../lib/core/types/types';

// import appCss from './App.module.css';
import { getUis, UiKey } from '../../setup';

export const GoUi = () => {
	const [patches, setPatches] = useState<RdfPatch[]>([]);

	return (
		<div>
			<RdfGraphDiagram initDiagram={} rdfPatches={patches} />
		</div>
	);
};
