import { renderHook, act } from '@testing-library/react';
import useModalDetails from '../src/hooks/useModalDetails';

test('useModalDetails_openModal', () => {
    const { result } = renderHook(() => useModalDetails());

    act(() => {
        result.current.openModal({id:1})
    });

    expect(result.current.id).toBe(1);

})

test('useModalDetails_closeModal', () => {
    const { result } = renderHook(() => useModalDetails());

    act(() => {
        result.current.openModal({id:1})
        result.current.onCancel()
    })

    expect(result.current.open).toBe(false);
})