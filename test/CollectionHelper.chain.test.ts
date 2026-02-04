import CollectionHelper, {
    collection,
    treeFilter,
    IMultiTreeItem,
} from '../src/CollectionHelper';

interface DemoNode extends IMultiTreeItem<DemoNode> {
    id: number;
    label: string;
    enabled?: boolean;
}

const buildDemoTree = (): DemoNode[] => ([
    {
        id: 1,
        label: '1',
        enabled: true,
        children: [
            {
                id: 2,
                label: '2',
                enabled: true,
                children: [
                    { id: 3, label: '3', enabled: false },
                ],
            },
        ],
    },
    {
        id: 4,
        label: '4',
        enabled: false,
    },
]);

describe('legacy CollectionHelper API', () => {
    test('findInTreeFirst keeps behavior', () => {
        const tree = buildDemoTree();
        const found = CollectionHelper.findInTreeFirst(tree, x => x.id === 3);
        expect(found?.id).toBe(3);
    });

    test('findInTree returns empty when not matched', () => {
        const tree = buildDemoTree();
        const found = CollectionHelper.findInTree(tree, x => x.id === 99);
        expect(found).toHaveLength(0);
    });

    test('treeMap maps without mutating source', () => {
        const tree = buildDemoTree();
        const mapped = CollectionHelper.treeMap<DemoNode, DemoNode>(tree, x => ({
            id: x.id,
            label: `mapped-${x.label}`,
            children: [],
        }));

        expect(mapped[0]).not.toBe(tree[0]);
        expect(mapped[0]?.children?.[0]?.label).toBe('mapped-2');
        expect(tree[0]?.label).toBe('1');
    });

    test('treeFilter filters and clones matched nodes', () => {
        const tree = buildDemoTree();
        const result = treeFilter(
            tree,
            node => node.children,
            (node, children) => { node.children = children; },
            node => node.enabled === true,
        );

        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe(1);
        expect(result[0]).not.toBe(tree[0]);
        expect(result[0]?.children).toHaveLength(1);
        expect(result[0]?.children?.[0]?.id).toBe(2);
    });
});

describe('chainable collection API', () => {
    test('value and first helpers', () => {
        const tree = buildDemoTree();
        const chain = collection(tree);

        expect(chain.first()?.id).toBe(1);
        expect(chain.first(x => x.id === 4)?.id).toBe(4);
        expect(chain.findInTreeFirst(x => x.id === 2).value()?.id).toBe(2);
    });

    test('findInTree chaining returns matches', () => {
        const tree = buildDemoTree();
        const matches = collection(tree)
            .findInTree(x => x.enabled === true)
            .value();

        expect(matches.map(x => x.id)).toEqual([1, 2]);
    });

    test('mapTree chaining produces new tree', () => {
        const tree = buildDemoTree();
        const mapped = collection(tree)
            .mapTree(node => ({ ...node, label: `#${node.label}` }))
            .value();

        expect(mapped[0]?.label).toBe('#1');
        expect(mapped[0]).not.toBe(tree[0]);
        expect(mapped[0]?.children?.[0]?.label).toBe('#2');
    });

    test('filterTree chaining removes unmatched nodes', () => {
        const tree = buildDemoTree();
        const filtered = collection(tree)
            .filterTree(node => node.enabled === true)
            .value();

        expect(filtered).toHaveLength(1);
        expect(filtered[0]?.id).toBe(1);
        expect(filtered[0]?.children?.[0]?.id).toBe(2);
        expect(filtered[0]?.children?.[0]?.children).toHaveLength(0);
    });

    test('supports custom children key via options', () => {
        interface AltNode extends IMultiTreeItem<AltNode> {
            id: number;
            subs?: AltNode[];
        }

        const tree: AltNode[] = [
            { id: 1, subs: [{ id: 2 }] },
        ];

        const found = collection(tree, { childrenKey: 'subs' })
            .findInTreeFirst(node => node.id === 2)
            .value();

        expect(found?.id).toBe(2);
    });
});
