import { useEffect, useState } from 'react';

import { RdfGraphDiagram } from '../../../../lib/go/RdfGraphDiagram';

import { RdfPatch } from '../../../../lib/core/types/types';

import { DataFactory } from 'n3';
import { defaultInitDiagram } from './init';

const { quad: q, literal: l, namedNode: n } = DataFactory;

export const GoUi = () => {
	const [patches, setPatches] = useState<RdfPatch[]>([]);

	useEffect(() => {
		setPatches([{ action: 'add', data: q(n('S'), n('label'), l('Hello')) }]);
	}, []);

	return (
		<div>
			<RdfGraphDiagram initDiagram={defaultInitDiagram} rdfPatches={patches} />
		</div>
	);
};
