import {CollectionHelper}  from '../src/index'


const demoTree = [{ name: '1', children: [{ name: '2', children: [{ name: '3',children:[] }] }] }, { name: '4', children: [{ name: '5',children:[] }] }]

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