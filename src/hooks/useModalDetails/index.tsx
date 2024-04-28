import { useState } from 'react';
import { Input } from '../useModalEdit';

export type ShowModalProps<V> = {
  id?: string | number;
  value?: V;
  open?: boolean;
  onCancel: () => void;
};

function useModalDetails<V>() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<V>();
  const [id, setId] = useState<string | number>();

  const openModal = (input:Input<V>) => {
    setOpen(true);
    if (input === undefined) {
      throw new Error('当OpType为Edit时必须传入input参数');
    }
    if ('value' in input) {
      setValue(input.value!!);
    } else {
      setId(input.id);
    }
  };

  const closeModal = () => {
    setOpen(false);
  };

  return { id, value, open, onCancel: closeModal, openModal };
}

export default useModalDetails