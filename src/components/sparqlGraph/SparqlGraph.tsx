import React, { useCallback, useEffect, useState } from 'react';

import { SparqlGraphProps, View } from './SparqlGraph.types';
import { ChartInterface } from '../../interface/chart';
import { ProgressiveChart } from '../../interface';
import { executeSparql } from '../../network/sparql';
import { getErrorMsg } from '../../utils/getErrorMSG';
import { Details } from '../details';
import { RawViewer } from '../rawViewer';
import { applyReasoning } from '../../mapper/applyReasoning';

export const SparqlGraph = ({
	query,
	preferredView,
	setStatus,
	environment,
	refresh,
	transformations,
	hasStrictMode = false,
	layout = 'Cola',
}: SparqlGraphProps) => {
	const [viewType, setViewType] = useState<View>('empty');
	const [content, setContent] = useState<string>('');
	const [transformedContent, setTransformedContent] = useState<string>('');
	const translate = useCallback(async () => {
		if (viewType !== 'graph' || !transformations || transformations.filter((t) => t.checked).length < 1) {
			setTransformedContent(content);
			return;
		}

		const query_result = await applyReasoning(content, transformations);
		setTransformedContent(query_result);
	}, [content, transformations, hasStrictMode]);

	useEffect(() => {
		translate().catch(console.error);
	}, [translate]);

	useEffect(() => {
		const hasConstruct = query.toLowerCase().includes('construct');
		const hasLimit = query.toLowerCase().includes('limit');
		const hasOffset = query.toLowerCase().includes('offset');
		const isProgressive = preferredView['turtle'] === 'progressive graph' && hasConstruct;

		if (isProgressive) {
			if (hasLimit || hasOffset) {
				setStatus({
					state: 'error',
					message: 'Cannot include limit or offset in construct when using progressive graph view',
				});
				setViewType('empty');
			} else {
				setViewType('progressive graph');
			}
		} else if (query) {
			setStatus({ state: 'loading', message: '' });
			// NO THEN
			executeSparql(query, environment)
				.then((data) => {
					setViewType(preferredView[data.dataType]);
					setContent(data.content);
					setStatus({ state: 'ok', message: '' });
				})
				.catch((error) => {
					setStatus({
						state: 'error',
						message: getErrorMsg(error),
					});
					setViewType('empty');
				});
		}
	}, [refresh, preferredView, query]);

	const view2jsx: { [key in View]: JSX.Element } = {
		graph: <ChartInterface turtle={transformedContent} environment={environment} isStrictMode={hasStrictMode} layout={layout} />,
		'progressive graph': <ProgressiveChart turtleQuery={query} setStatus={setStatus} environment={environment} />,
		table: <Details resultAsString={content} />,
		raw: <RawViewer content={content} />,
		empty: <div></div>,
	};

	return view2jsx[viewType];
};
