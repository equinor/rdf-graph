import { FC, useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Button } from '@equinor/eds-core-react';
import Cytoscape from 'cytoscape';

import { useMappers, sleep, layoutCola, getErrorMsg } from '../../utils';
import { SpinningGear, StatusProps, EnvironmentsViewProps } from '../../components';
import { executeSparql } from '../../network';
import { useTurtleHelpers } from '../../hooks';

import playIcon from '../../static/images/play.svg';
import pauseIcon from '../../static/images/pause.svg';

interface ProgressiveChartProps {
	environment: EnvironmentsViewProps;
	turtleQuery: string;
	setStatus: React.Dispatch<React.SetStateAction<StatusProps>>;
}

export const ProgressiveChart: FC<ProgressiveChartProps> = ({ turtleQuery, setStatus, environment }: ProgressiveChartProps): JSX.Element => {
	const [turtle2Edges] = useTurtleHelpers();
	const [edges2ElementDefinitions] = useMappers();

	const cyRef = useRef<Cytoscape.Core>();

	const playRef = useRef<boolean>(false);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const play = (): void => {
		setIsPlaying(true);
		playRef.current = true;
	};

	const pause = (): void => {
		setIsPlaying(false);
		playRef.current = false;
	};

	const offset = useRef<number>(0);

	useEffect(() => {
		if (cyRef?.current) {
			cyRef.current.elements().remove();
		}
		pause();
		// See https://stackoverflow.com/questions/53332321/react-hook-warnings-for-async-function-in-useeffect-useeffect-function-must-ret
		populateCytoscape();
	}, [turtleQuery, environment]);

	const populateCytoscape = async () => {
		try {
			const limit = 2;
			const duration = 2000;

			while (playRef.current) {
				if (!cyRef?.current) {
					await sleep(duration);
					continue;
				}

				const offsetString = `\nLIMIT ${limit}\nOFFSET ${offset.current}`;
				const turtle = await executeSparql(turtleQuery + offsetString, environment);
				const edgeAdditions = await turtle2Edges(turtle.content);
				cyRef.current.add(edges2ElementDefinitions(edgeAdditions));

				const subLayout = cyRef.current.makeLayout(layoutCola);
				subLayout.run();
				offset.current += limit;
				await sleep(duration);
			}
		} catch (error) {
			setStatus({ state: 'error', message: getErrorMsg(error) });
		}
	};

	return (
		<div className="Graph">
			<div className="buttonPadding">
				<Button
					className="pushable"
					variant="ghost_icon"
					onClick={() => {
						play();
						populateCytoscape();
					}}>
					<span className="shadow"></span>
					<img src={playIcon} alt="play" />
				</Button>
			</div>
			<div className="buttonPadding">
				<Button className="pushable" variant="ghost_icon" color="primary" onClick={() => pause()}>
					<span className="shadow"></span>
					<img src={pauseIcon} alt="pause" />
				</Button>
			</div>
			<SpinningGear isPlaying={isPlaying} />
			<div className="content">
				<CytoscapeComponent
					elements={CytoscapeComponent.normalizeElements({
						nodes: [],
						edges: [],
					})}
					style={{
						width: '100%',
						height: '1000px',
					}}
					stylesheet={[
						{
							selector: 'node',
							style: {
								label: 'data(label)',
							},
						},
						{
							selector: 'edge',
							style: {
								width: 4,
								'line-color': '#ccc',
								'mid-target-arrow-color': '#f00',
								'mid-source-arrow-fill': 'filled',
								'mid-target-arrow-shape': 'triangle-backcurve',
								'arrow-scale': 2,
								'curve-style': 'bezier',
							},
						},
					]}
					cy={(x) => (cyRef.current = x)}
				/>
			</div>
		</div>
	);
};
