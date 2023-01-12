import { DirectProp, GraphElement, GraphPatch, GraphPropertyPatch } from "core/types/core";
import { AlgorithmResult } from "./algorithms.types";

export const highlightElement = (element: GraphElement): AlgorithmResult => {
    const undoPatches = [];
    if (element.type !== 'node') {
        return {patches: [], undoPatches: []};
    }
    const patch: GraphPropertyPatch = {
        id: element.id,
        prop: { type: 'direct', key: 'fill', value: 'pink' },
        type: 'property',
    };
    const oldProp = element.props.find(p => p.type === 'direct' && p.key === 'fill') as DirectProp | undefined;
    if (oldProp) {
        const newPatch: GraphPatch = {action: 'add', content: {id: element.id, type: 'property', prop: {
            key: 'fill', type: 'direct', value: oldProp.value[0]}
        }};
        undoPatches.push(newPatch);
    }
    
    return {
        patches: [{ action: 'add', content: patch }],
        undoPatches: undoPatches
    }
};

export const createSummary = (element: GraphElement, visited: string[]): AlgorithmResult => {
    if (element.type === 'node') {
        const oldProp = element.props.find((p) => p.type === 'direct' && p.key === 'label');
        const oldLabel = oldProp ? (oldProp as DirectProp).value[0] : '';
        const patches: GraphPatch[] = [];
        if (oldLabel) {
            patches.push({
                action: 'remove',
                content: {
                    id: element.id,
                    prop: { type: 'direct', key: 'label', value: oldLabel },
                    type: 'property',
                },
            });
        }

        const reachable = visited.length - 1;
        const plural = reachable === 1 ? '' : 's';
        const newLabel = `${oldLabel} (${reachable} node${plural} reachable from this node)`;

        patches.push({
            action: 'add',
            content: {
                id: element.id,
                prop: { type: 'direct', key: 'label', value: newLabel },
                type: 'property',
            },
        });
        return {
            patches: patches,
            undoPatches: []
        }
    }
    return {
        patches: [],
        undoPatches: []
    };
};
