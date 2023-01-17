import { useGraphContext } from '../../context/GraphContext';

import css from './TabGraphState.module.css';

export const TabGraphState = () => {
	const { graphContext } = useGraphContext();

	return (
		<div className={css.json}>
			<pre style={{ color: 'black', fontSize: '12', padding: '5px' }}>
				{JSON.stringify(graphContext.graphState, undefined, 2)}
			</pre>
		</div>
	);
};
