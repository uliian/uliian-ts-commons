export interface IMultiTreeItem<T> {
    children?: T[];
}

type ChildrenSelect<T> = (item: T) => T[] | undefined;
type ChildrenSet<T> = (item: T, children: T[]) => void;

type CollectionOptions<T> = {
    childrenKey?: string;
    getChildren?: ChildrenSelect<T>;
    setChildren?: ChildrenSet<T>;
};

type ResolvedChildrenAccess<T> = {
    getChildren: ChildrenSelect<T>;
    setChildren: ChildrenSet<T>;
};

const resolveChildrenAccess = <T>(options?: CollectionOptions<T> | ResolvedChildrenAccess<T>): ResolvedChildrenAccess<T> => {
    if (options && "getChildren" in options && "setChildren" in options && !("childrenKey" in options)) {
        return options as ResolvedChildrenAccess<T>;
    }
    const opt = options as CollectionOptions<T> | undefined;
    const key = opt?.childrenKey ?? "children";
    const getChildren: ChildrenSelect<T> = opt?.getChildren
        ?? ((item: T) => (item as unknown as Record<string, unknown>)[key] as T[] | undefined);
    const setChildren: ChildrenSet<T> = opt?.setChildren
        ?? ((item: T, children: T[]) => {
            (item as unknown as Record<string, unknown>)[key] = children;
        });
    return { getChildren, setChildren };
};

export function findInTreeFirst<T extends IMultiTreeItem<T>>(
    tree: T[],
    condition: (x: T) => boolean,
    options?: CollectionOptions<T>,
): T | null {
    const { getChildren } = resolveChildrenAccess(options);
    for (const item of tree) {
        if (condition(item)) {
            return item;
        }
        const children = getChildren(item) ?? [];
        if (children.length > 0) {
            const result = findInTreeFirst(children, condition, options);
            if (result) {
                return result;
            }
        }
    }
    return null;
}

export function findInTree<T extends IMultiTreeItem<T>>(
    tree: T[],
    condition: (x: T) => boolean,
    options?: CollectionOptions<T>,
): T[] {
    const { getChildren } = resolveChildrenAccess(options);
    const result: T[] = [];

    const dfs = (nodes: T[]) => {
        for (const item of nodes) {
            if (condition(item)) {
                result.push(item);
            }
            const children = getChildren(item) ?? [];
            if (children.length > 0) {
                dfs(children);
            }
        }
    };

    dfs(tree ?? []);
    return result;
}

export function treeMap<TOut extends IMultiTreeItem<TOut>, TIn extends IMultiTreeItem<TIn>>(
    tree: TIn[],
    mapFun: (x: TIn) => TOut,
    options?: CollectionOptions<TIn>,
): TOut[] {
    const inputAccess = resolveChildrenAccess<TIn>(options);
    const outputAccess = resolveChildrenAccess<TOut>(options as unknown as CollectionOptions<TOut>);
    const result: TOut[] = [];
    for (const item of tree ?? []) {
        const newItem = mapFun(item);
        result.push(newItem);
        const children = inputAccess.getChildren(item) ?? [];
        if (children.length > 0) {
            const childrenResult = treeMap(children, mapFun, options);
            outputAccess.setChildren(newItem, childrenResult as unknown as TOut[]);
        }
    }
    return result;
}

export function treeFilter<TIn>(
    tree: TIn[],
    childrenSelect: ChildrenSelect<TIn>,
    childrenSet: ChildrenSet<TIn>,
    condition: (x: TIn) => boolean,
): TIn[] {
    const result: TIn[] = [];
    for (const item of tree ?? []) {
        const children = childrenSelect(item) ?? [];
        const filteredChildren = children.length > 0
            ? treeFilter(children, childrenSelect, childrenSet, condition)
            : [];
        const match = condition(item);
        if (match) {
            const cloned = { ...(item as unknown as Record<string, unknown>) } as TIn;
            if (children.length > 0) {
                childrenSet(cloned, filteredChildren);
            }
            result.push(cloned);
        }
    }
    return result;
}

class TreeCollection<T extends IMultiTreeItem<T>, TData> {
    private readonly access: ResolvedChildrenAccess<T>;

    constructor(data: TData, access: ResolvedChildrenAccess<T>) {
        this.data = data;
        this.access = access;
    }

    private data: TData;

    value(): TData {
        return this.data;
    }

    tap(fn: (data: TData) => void): this {
        fn(this.data);
        return this;
    }

    findInTreeFirst(condition: (x: T) => boolean): TreeCollection<T, T | null> {
        const found = findInTreeFirst(this.asTree(), condition, this.access);
        return new TreeCollection<T, T | null>(found, this.access);
    }

    first(condition?: (x: T) => boolean): T | null {
        if (condition) {
            return findInTreeFirst(this.asTree(), condition, this.access);
        }
        if (Array.isArray(this.data)) {
            return ((this.data as unknown as T[])[0] ?? null) as T | null;
        }
        return (this.data as unknown as T | null) ?? null;
    }

    findInTree(condition: (x: T) => boolean): TreeCollection<T, T[]> {
        const items = findInTree(this.asTree(), condition, this.access);
        return new TreeCollection<T, T[]>(items, this.access);
    }

    mapTree<TOut extends IMultiTreeItem<TOut>>(mapFun: (x: T) => TOut): TreeCollection<TOut, TOut[]> {
        const mapped = treeMap<TOut, T>(this.asTree(), mapFun, this.access as unknown as CollectionOptions<T>);
        const nextAccess = resolveChildrenAccess<TOut>(this.access as unknown as CollectionOptions<TOut>);
        return new TreeCollection<TOut, TOut[]>(mapped, nextAccess);
    }

    filterTree(condition: (x: T) => boolean): TreeCollection<T, T[]> {
        const filtered = treeFilter(this.asTree(), this.access.getChildren, this.access.setChildren, condition);
        return new TreeCollection<T, T[]>(filtered, this.access);
    }

    private asTree(): T[] {
        if (Array.isArray(this.data)) {
            return this.data as unknown as T[];
        }
        const value = this.data as unknown as T | null | undefined;
        return value ? [value] : [];
    }
}

export const collection = <T extends IMultiTreeItem<T>>(
    tree: T[],
    options?: CollectionOptions<T>,
): TreeCollection<T, T[]> => {
    const access = resolveChildrenAccess(options);
    return new TreeCollection<T, T[]>(tree ?? [], access);
};

const CollectionHerlper = {
    findInTreeFirst<T extends IMultiTreeItem<T>>(tree: T[], condition: (x: T) => boolean): T | null {
        return findInTreeFirst(tree, condition);
    },
    findInTree<T extends IMultiTreeItem<T>>(tree: T[], condition: (x: T) => boolean): T[] {
        return findInTree(tree, condition);
    },
    treeMap<TOut extends IMultiTreeItem<TOut>, TIn extends IMultiTreeItem<TIn>>(tree: TIn[], mapFun: (x: TIn) => TOut): TOut[] {
        return treeMap(tree, mapFun);
    },
    treeFilter<TIn>(
        tree: TIn[],
        childrenSelect: ChildrenSelect<TIn>,
        childrenSet: ChildrenSet<TIn>,
        condition: (x: TIn) => boolean,
    ): TIn[] {
        return treeFilter(tree, childrenSelect, childrenSet, condition);
    },
};

export default CollectionHerlper;
