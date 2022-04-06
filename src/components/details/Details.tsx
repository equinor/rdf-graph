import { FC } from 'react';
import { Table } from '@equinor/eds-core-react';

import { httpResult2SparqlResult } from '../../mapper';
import { SparqlType } from '../../models';

import { SparqlValueProps, DetailsProps, SparqlResultBindingProps } from './Details.types';

export const SparqlValue = ({ sparqlBinding }: SparqlValueProps) => {
	const type2jsx: { [key in SparqlType]: JSX.Element } = {
		uri: <div>{sparqlBinding.value}</div>,
		literal: <div>{sparqlBinding.value}</div>,
		bnode: <div>{sparqlBinding.value}</div>,
	};

	return type2jsx[sparqlBinding.type];
};

export const Details: FC<DetailsProps> = ({ resultAsString, isAlphabetised }: DetailsProps) => {
	const SparqlValue = ({ sparqlBinding }: SparqlValueProps) => {
		const type2jsx: { [key in SparqlType]: JSX.Element } = {
			uri: <div>{sparqlBinding.value}</div>,
			literal: <div>{sparqlBinding.value}</div>,
			bnode: <div>{sparqlBinding.value}</div>,
		};

		return type2jsx[sparqlBinding.type];
	};

	const sparqlResult = httpResult2SparqlResult(resultAsString);

	if (isAlphabetised) {
		const filterValueByKey = ({ bindings }: any) =>
			bindings.filter(({ variableName }: SparqlResultBindingProps) => variableName === 'key')[0].value;

		sparqlResult.results.sort((a, b) => (filterValueByKey(a) !== filterValueByKey(b) ? (filterValueByKey(a) < filterValueByKey(b) ? -1 : 1) : 0));
	}

	return (
		<Table>
			<Table.Head>
				<Table.Row key="result_header">
					{sparqlResult.headers.map((h, index) => (
						<Table.Cell key={`result_header${index}`}>{h}</Table.Cell>
					))}
				</Table.Row>
			</Table.Head>
			<Table.Body>
				{sparqlResult.results.map((r, row_index) => (
					<Table.Row key={`result_row${row_index}`}>
						{' '}
						{r.bindings.map((b, col_index) => (
							<Table.Cell key={`result_cell${row_index}_${col_index}`}>
								<SparqlValue sparqlBinding={b} />
							</Table.Cell>
						))}
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	);
};
