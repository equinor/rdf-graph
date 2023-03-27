import { Tooltip, Typography } from '@equinor/eds-core-react';
import { TypographyVariants } from '@equinor/eds-core-react/dist/types/components/Typography/Typography.tokens';
import { prettyIri } from '../../rdf/rdf-utils';

import css from './RdfIri.module.css';

export const RdfIri: React.FunctionComponent<{
	iri: string;
	variant?: TypographyVariants;
	singleLine?: boolean;
}> = ({ iri, variant, singleLine }) => {
	const vari = variant ?? 'body_short';
	if (!iri) return <Typography variant={vari}>{iri}</Typography>;

	const sl = singleLine === undefined ? true : singleLine;
	const style: React.CSSProperties = { flexDirection: sl ? 'row' : 'column' };

	const pretty = prettyIri(iri).split(':');

	return (
		<div className={css.rdfIri} style={style}>
			{pretty.length === 2 ? (
				<>
					<Tooltip enterDelay={200} title={iri}>
						<Typography variant={vari} color="DodgerBlue">
							{pretty[0]}:
						</Typography>
					</Tooltip>
					<Typography variant={vari}>{pretty[1]}</Typography>
				</>
			) : (
				<Typography variant={vari}>{iri}</Typography>
			)}
		</div>
	);
};
