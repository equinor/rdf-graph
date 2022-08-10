import { FC, useEffect, useRef, useState } from 'react';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { ForceGraph3D } from 'react-force-graph';
import { GraphEdge, AbstractNode } from '../../models/graphModel';
import { GraphProps } from '../../state/GraphStateProps';
import { Group, Renderer } from 'three';

const obj = `# Blender v3.2.0 OBJ File: 'DummyValve.blend'
# www.blender.org
mtllib DummyValve.mtl
o Cube
v 1.000000 1.000000 -1.000000
v 1.000000 -1.000000 -1.000000
v 1.000000 1.000000 1.000000
v 1.000000 -1.000000 1.000000
v -1.000000 1.000000 -1.000000
v -1.000000 -1.000000 -1.000000
v -1.000000 1.000000 1.000000
v -1.000000 -1.000000 1.000000
v 0.000000 0.000000 0.000000
v 0.000000 0.000000 0.000000
v 0.000000 0.000000 0.000000
v 0.000000 0.000000 0.000000
vt 0.625000 0.625000
vt 0.875000 0.625000
vt 0.875000 0.750000
vt 0.625000 0.750000
vt 0.375000 0.750000
vt 0.625000 1.000000
vt 0.375000 1.000000
vt 0.375000 0.125000
vt 0.625000 0.125000
vt 0.625000 0.250000
vt 0.375000 0.250000
vt 0.125000 0.625000
vt 0.375000 0.625000
vt 0.125000 0.750000
vt 0.625000 0.500000
vt 0.375000 0.500000
vt 0.125000 0.500000
vt 0.375000 0.000000
vt 0.625000 0.000000
vt 0.875000 0.500000
vn 0.0000 0.7071 -0.7071
vn 0.0000 0.0000 1.0000
vn -0.7071 0.0000 0.7071
vn 0.0000 -0.7071 -0.7071
vn 0.7071 0.0000 -0.7071
vn 0.0000 0.0000 -1.0000
vn 0.7071 0.0000 0.7071
vn 0.0000 -0.7071 0.7071
vn -0.7071 0.0000 -0.7071
vn 0.0000 0.7071 0.7071
usemtl Material
s off
f 10/1/1 11/2/1 7/3/1 3/4/1
f 4/5/2 3/4/2 7/6/2 8/7/2
f 9/8/3 11/9/3 5/10/3 6/11/3
f 9/12/4 12/13/4 4/5/4 8/14/4
f 12/13/5 10/1/5 3/4/5 4/5/5
f 6/11/6 5/10/6 1/15/6 2/16/6
f 2/16/7 1/15/7 10/1/7 12/13/7
f 6/17/8 2/16/8 12/13/8 9/12/8
f 8/18/9 7/19/9 11/9/9 9/8/9
f 1/15/10 5/20/10 11/2/10 10/1/10
`;

const loader = new OBJLoader();
type f3DState = {
	nodes: AbstractNode[];
	links: GraphEdge[];
};

const filterable = function* <T>(source: Iterable<T>, filter: (e: T) => boolean) {
	for (const e of source) if (filter(e)) yield e;
};

export const F3DGraph: FC<GraphProps & object> = ({ graphState, graphPatch, ...rest }) => {
	const renderer = useRef(new CSS3DRenderer());
	const [model, update] = useState<f3DState>({
		nodes: [],
		links: [],
	});
	useEffect(() => {
		// Requiered for 3DGraph rendering
		for (const _ of graphPatch) {
		}
		update({ nodes: [...filterable(graphState.nodeIndex.values(), (n) => n.type === 'node')], links: [...graphState.linkIndex.values()] });
		console.log('whats up with', model);
	}, [graphPatch]);

	return (
		<ForceGraph3D
			width={1000}
			height={800}
			graphData={model}
			enableNodeDrag={true}
			nodeLabel={(node: any) => node.label}
			nodeAutoColorBy="group"
			nodeThreeObjectExtend={true}
			extraRenderers={[renderer.current as any as Renderer]}
			nodeThreeObject={(node: any) => {
				if (node.properties.get('http://rdf.equinor.com/raw/stid/JSON_PIPELINE#tagType') === 'VG') {
					const group = loader.parse(obj);
					return group;
				}
				return new Group();
			}}
			{...rest}
		/>
	);
};
