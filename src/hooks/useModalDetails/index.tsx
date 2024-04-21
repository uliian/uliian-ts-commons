import { useState } from 'react';

export type ShowModalProps = {
  id?: string | number;
  value?: any;
  open?: boolean;
  onCancel: () => void;
};

function useModalDetails() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState();
  const [id, setId] = useState<string | number>();

  const openModal = (value?: any, id?: string | number) => {
    setOpen(true);
    setValue(value);
    setId(id);
  };

  const closeModal = () => {
    setOpen(false);
  };

  return { id, value, open, onCancel: closeModal, openModal };
}

export default useModalDetails