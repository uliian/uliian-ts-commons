# ULiiAn的TS开发工具方法
主要设计三个方面的内容：1、集合处理帮助类。2、ajax调用类。3、ReactHook。

## ReactHook相关
提供了三个hook：
### useModalDetails 弹窗展示hook
这个hook主要用于弹窗展示，用于Modal窗口的控制。使用方法：
```jsx
const showDetailsProps = useModalDetails()
const {id, value, open, onCancel, openModal} = showDetailsProps
```
提供了这几个值以供弹窗使用。id和value根据openModal时进行传入，根据自己的需求使用即可，如果传入id，则在组件中根据id获取展示的值再进行展示，如果传入value则直接展示，根据需要自行处理。使用

```jsx
//CustomComponent.tsx
const CustomComponent = (props:ShowModalProps<V>)=>{
    {/* 根据你传入的是value还是id自行获取数据填充 */ }
    <Modal open={open} onCancel={onCancel}>
     {/* children */ }
    </Modal>
}


<Button onClick={()=>openModal({id:xxxx})}/>

<CustomComponent {...showDetailsProps}/>


```


### useModalEdit 弹窗展示hook

这个hook主要用于编辑类的弹窗管理用法和`useModalDetails`类似，主要区别在于多了opType用于明确是编辑操作还是新增操作，以及增加了action参数操作用以执行提交数据后的后续操作(如刷新)。
使用方法：
```jsx
const showEditProps = useModalEdit<V>()

const CustomComponent = (props:ShowModalEditProps<V>)=>{
    const {value, opType, open, onCancel, onSubmit} = props
    {/* 根据你传入的是value还是id自行获取数据填充 */ }
    <Modal open={open} onCancel={onCancel}>
        <Form onFinish={(v)=>{/* TODO */ onSubmit()}}>
            {/* children */ }
        </Form>
    </Modal>
}

<Button onClick={()=>openModal(OpType.Edit,{id:xxxx},()=>{ref.current?.reload?.()})}/>


<CustomComponent {...showDetailsProps}/>

```

为什么要在openModal处传入finishAction而不是在调用hook时就传入？一个很典型的应用场景是AntdPro中，ProTable组件的列定义中，render参数中自带了actionRef参数，而不需要自己去uesRef再定义，并且这样的操作自然也更加灵活。

#### 关于弹窗hook的使用技巧
1、如果出现需要向组件中加入更多参数的场景，我们做一个简单的类型体操就好：
```typescript
const CustomComponent = (props:ShowModalEditProps<V> & {name?:string,info?:string,pid?:number})=>{
        const {value, opType, open, onCancel, onSubmit,name,info,pid} = props
}
```

### useOffsetPage 偏移量分页处理hook
在处理偏移量分页方案时（瀑布流场景），其实处理起来很讨厌，关键在于
> 1、需要记录最后一次偏移量
> 2、获取新的值后要与原列表合并而不像普通分页那样直接丢弃原列表
> 3、变更查询参数后，要置空现有列表

这几个问题处理起来挺讨厌，比普通分页麻烦的多。通过这个hook，能很好的解决这几个问题,使用起来非常简单：
```typescript
const {
    offset,
    records,
    hasMore,
    loading,
    getMore} = useOffsetPage((offestPageCondition)=>request(offsetPageCondition),queryParams,{})
```

queryParams为查询的其他查询参数，最终会和offsetPageCondition一起作为查询字符串进行处理，同时，该值产生变化将触发列表、分页条件重置。options中，有ready方法，如果存在该方法，则需要在该方法执行结果为true后才会发起请求，pageSize也可以在options中进行配置。另外在options中，有dependencys属性，该属性用于条件刷新。

## 网络请求相关

## 集合帮助方法