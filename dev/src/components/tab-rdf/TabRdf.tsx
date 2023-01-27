import { Table } from '@equinor/eds-core-react';

import { MimeFormat, Prefixes, Quad, Writer } from 'n3';
import { useEffect, useState } from 'react';

import { useGraphContext } from '../../context/GraphContext';
import { RdfIri } from '../rdf-iri/RdfIri';
import { getRdfPrefixes } from '../../rdf/rdf-utils';
//import css from './TabGraphState.module.css';

function _quadsToRdf({}: { quads: Quad[]; format?: MimeFormat }) {}

export const TabRdf = () => {
	const { graphContext } = useGraphContext();

	const [quads, setQuads] = useState<Quad[]>([]);

	useEffect(() => {
		if (!graphContext.quadStore) return;
		const quadItems: Quad[] = [];

		for (const q of graphContext.quadStore) {
			quadItems.push(q);
		}
		setQuads(quadItems);
		exportAsString();
	}, [graphContext.quadStore]);

	function exportAsString() {
		if (!graphContext.quadStore) return;

		const pref: Prefixes<string> = {};

		for (const [k, v] of getRdfPrefixes()) {
			pref[k] = v;
		}

		const writer = new Writer({ prefixes: pref, format: '' });

		for (const q of graphContext.quadStore) {
			writer.addQuad(q);
		}

		writer.end((error, result) => console.log(result));
	}

	return (
		<Table>
			<Table.Head>
				<Table.Row>
					<Table.Cell>#</Table.Cell>
					<Table.Cell>Subject</Table.Cell>
					<Table.Cell>Predicate</Table.Cell>
					<Table.Cell>Object</Table.Cell>
				</Table.Row>
			</Table.Head>

			<Table.Body>
				{quads.map((p, i) => (
					<Table.Row key={i}>
						<Table.Cell>{i + 1}</Table.Cell>
						<Table.Cell>
							<RdfIri iri={p.subject.value} singleLine={false} />
						</Table.Cell>
						<Table.Cell>
							<RdfIri iri={p.predicate.value} singleLine={false} />
						</Table.Cell>
						<Table.Cell>
							<RdfIri iri={p.object.value} singleLine={false} />
						</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	);
};
