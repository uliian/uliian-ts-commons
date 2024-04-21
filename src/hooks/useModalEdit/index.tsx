import { OpType } from '@/services/utils';
import { useRef, useState } from 'react';

type Input<T> = { id: string | number } | { value: T };
export type ShowModalEditProps<V> = {
  id?: string | number;
  value?: V;
  open?: boolean;
  opType: OpType;
  onCancel: () => void;
  onSubmit: (value: V) => void;
  openModal: (opType: OpType, input?: Input<V>, action?: ()=>void) => void;
};

export default function useModalEdit<V>(): ShowModalEditProps<V> {
  const [value, setValue] = useState<V>();
  const [id, setId] = useState<string | number>();
  const [open, setOpen] = useState(false);
  const [opType, setOpType] = useState<OpType>(OpType.Create);
  const closeHandlerRef = useRef<()=>void>()


  const openModal = (opType: OpType, input?: Input<V>, action?: ()=>void) => {
    setOpen(true);
    setOpType(opType);
    closeHandlerRef.current = action
    if (opType === OpType.Create) {
      setValue(undefined);
      setId(undefined);
      return;
    } else {
      if (input === undefined) {
        throw new Error('当OpType为Edit时必须传入input参数');
      }
      if ('value' in input) {
        setValue(input.value);
      } else {
        setId(input.id);
      }
    }
  };

  const closeModal = () => {
    setOpen(false);
  };

  const onSubmit = (value: V) => {
    setOpen(false);
    setValue(value);
    closeHandlerRef.current?.()
  };

  return { id, value, opType, open, onCancel: closeModal, openModal, onSubmit };
}
