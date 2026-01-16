import { IMultiTreeItem } from '../src/CollectionHelper'
import {CollectionHelper}  from '../src/index'

interface DemoItem extends IMultiTreeItem<DemoItem> {
    name: string
}

const demoTree: DemoItem[] = [{ name: '1', children: [{ name: '2', children: [{ name: '3',children:[] }] }] }, { name: '4', children: [{ name: '5' }] }]

test('findInTreeFirst findOne', () => {
    const result = CollectionHelper.findInTreeFirst(demoTree, x => x.name === '3')
    expect(result?.name).toBe('3')
})

test('findInTreeFirst notFind', () => {
    const result = CollectionHelper.findInTreeFirst(demoTree, x => x.name === '8')
    expect(result).toBe(null)
})

test('findInTree findInTree', () => {
    const result = CollectionHelper.findInTree(demoTree, x => x.name === '3' || x.name==='4')
    expect(result.length).toBe(2)
})

test('findInTree notInTree', () => {
    const result = CollectionHelper.findInTree(demoTree, x => x.name === '8')
    expect(result.length).toBe(0)
})

test('treeMap transform properties', () => {
    interface TransformedItem extends IMultiTreeItem<TransformedItem> {
        name: string
    }
    const result = CollectionHelper.treeMap<TransformedItem, DemoItem>(demoTree, (x): TransformedItem => ({
        name: `transformed_${x.name}`,
        children: []
    }))
    expect(result[0]!.name).toBe('transformed_1')
    expect((result[0]!.children as TransformedItem[])[0]!.name).toBe('transformed_2')
    expect(((result[0]!.children as TransformedItem[])[0]!.children as TransformedItem[])[0]!.name).toBe('transformed_3')
})

test('treeMap preserve structure', () => {
    interface TransformedItem extends IMultiTreeItem<TransformedItem> {
        name: string
    }
    const result = CollectionHelper.treeMap<TransformedItem, DemoItem>(demoTree, (x): TransformedItem => ({
        name: x.name,
        children: []
    }))
    expect(result.length).toBe(2)
    expect((result[0]!.children as TransformedItem[]).length).toBe(1)
    expect(((result[0]!.children as TransformedItem[])[0]!.children as TransformedItem[]).length).toBe(1)
    expect((result[1]!.children as TransformedItem[]).length).toBe(1)
})

test('treeMap type conversion', () => {
    interface MappedItem extends IMultiTreeItem<MappedItem> {
        id: number
        label: string
    }
    const result = CollectionHelper.treeMap<MappedItem, DemoItem>(demoTree, (x): MappedItem => ({
        id: parseInt(x.name),
        label: `Item ${x.name}`,
        children: []
    }))
    expect(result[0]!.id).toBe(1)
    expect(result[0]!.label).toBe('Item 1')
    expect((result[0]!.children as MappedItem[])[0]!.id).toBe(2)
})
