import { Autocomplete, Button, Table, Typography } from '@equinor/eds-core-react';

import { Prefixes, Quad, Writer } from 'n3';
import { useEffect, useState } from 'react';

import { useGraphContext } from '../../context/GraphContext';
import { RdfIri } from '../rdf-iri/RdfIri';
import { getRdfPrefixes } from '../../rdf/rdf-utils';
import css from './TabRdf.module.css';

export async function copyTextToClipboard(text: string) {
	if ('clipboard' in navigator) {
		return await navigator.clipboard.writeText(text);
	} else {
		return document.execCommand('copy', true, text);
	}
}

const exportFormatOptions = ['Turtle', 'N-Triples'] as const;

function exportQuadsAsString(quads: Quad[], format: (typeof exportFormatOptions)[number]) {
	const pref: Prefixes<string> = {};

	for (const [k, v] of getRdfPrefixes()) {
		pref[k] = v;
	}

	const writer = new Writer({ prefixes: pref, format: format });
	writer.addQuads(quads);

	let res = '';

	writer.end((err, result) => {
		res = result;
	});

	return res;
}

export const TabRdf = () => {
	const { graphContext } = useGraphContext();

	const [quads, setQuads] = useState<Quad[]>([]);
	const [exportFormat, setExportFormat] = useState<(typeof exportFormatOptions)[number]>(
		exportFormatOptions[0]
	);
	const [isCopied, setIsCopied] = useState<boolean>(false);

	useEffect(() => {
		if (!graphContext.quadStore) return;
		const quadItems: Quad[] = [];

		for (const q of graphContext.quadStore) {
			quadItems.push(q);
		}
		setQuads(quadItems);
	}, [graphContext.quadStore]);

	async function exportToClipboardHandler() {
		if (quads.length === 0) return;
		const res = exportQuadsAsString(quads, exportFormat);
		await copyTextToClipboard(res);
		console.log(res);
		setIsCopied(true);
		setTimeout(() => {
			setIsCopied(false);
		}, 1500);
	}

	return (
		<div>
			<div className={css.export}>
				<Autocomplete
					className={css.exportFormatOpt}
					label="Export Format"
					initialSelectedOptions={[exportFormatOptions[0]]}
					options={[...exportFormatOptions]}
					onOptionsChange={(c) => {
						if (c.selectedItems[0]) setExportFormat(c.selectedItems[0]);
					}}
				/>
				<Button variant="contained" onClick={exportToClipboardHandler}>
					Export to Clipboard
				</Button>
				<Typography variant="h6">{isCopied ? 'Copied!' : ''}</Typography>
			</div>
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
		</div>
	);
};
