import { createDefaultNode } from '../node-factory/default-node-factory';

export function addNodeTransaction(d: go.Diagram, key: number) {
	//d.commitTransaction
}

export class DiagramTransactions {
	constructor(readonly _diagram: go.Diagram) {}

	addNode(key: number) {
		this._diagram.commit(function (d) {
			// have the Model add a new node data
			var newnode = createDefaultNode(key);
			d.model.addNodeData(newnode); // this makes sure the key is unique
			// and then add a link data connecting the original node with the new one
			//var newlink = { from: selnode.data.key, to: newnode.key };
			// add the new link to the model
			//d.model.addLinkData(newlink);
		}, 'add node');
	}
}
