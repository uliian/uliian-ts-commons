export interface IMultiTreeItem<T> {
    children: T[];
}


const CollectionHerlper = {
    /**
     * 多叉树查找
     * @param tree 树
     * @param condition 过滤条件
     */
    findInTreeFirst<T extends IMultiTreeItem<T>>(
        tree: T[],
        condition: (x: T) => boolean,
    ): T | null {
        for (let item of tree) {
            if (condition(item)) {
                return item;
            }
            if (item.children !== null && item.children!.length > 0) {
                let result = this.findInTreeFirst(item.children, condition);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    },

    /**
     * 多叉树查找
     * @param tree 树
     * @param condition 过滤条件
     */
    findInTree<T extends IMultiTreeItem<T>>(
        inputTree: T[],
        condition: (x: T) => boolean,
    ): T[] {
        const result: T[] = []
        const findInTreeWithResult = (tree: T[], result: T[]) => {
            for (let item of tree) {
                if (condition(item)) {
                    result.push(item)
                }
                if (item.children !== null && item.children!.length > 0) {
                    findInTreeWithResult(item.children, result);
                }
            }
        }

        findInTreeWithResult(inputTree, result)

        return result;
    },

    /**
     * 多叉树映射
     * @param tree 源
     * @param mapFun 映射方式
     * @returns
     */
    treeMap<TOut extends IMultiTreeItem<TOut>, TIn extends IMultiTreeItem<TIn>>(
        tree: TIn[],
        mapFun: (x: TIn) => TOut,
    ): TOut[] {
        const result: TOut[] = [];
        for (let item of tree) {
            const newItem = mapFun(item);
            result.push(newItem);
            if (item.children !== null && item.children!.length > 0) {
                let childrenResult = this.treeMap(item.children, mapFun);
                newItem.children = childrenResult;
            }
        }
        return result;
    },


    /**
     * 多叉树过滤
     * @param tree 源
     * @param mapFun 映射方式
     * @returns
     */
    treeFilter<TIn>(
        tree: TIn[],
        childrenSelct: (item: TIn) => TIn[] | undefined,
        childrenSet: (item: TIn, children: TIn[]) => void,
        condition: (x: TIn) => boolean,
    ): TIn[] {
        const result: TIn[] = [];
        for (let item of tree) {
            const match = condition(item)
            if (match) {
                result.push({ ...item });
            }
            if ((childrenSelct(item)?.length ?? 0) > 0) {
                let childrenResult = this.treeFilter(childrenSelct(item) ?? [], childrenSelct, childrenSet, condition);
                childrenSet(item, childrenResult)
            }
        }
        return result;
    }
}

export default CollectionHerlper