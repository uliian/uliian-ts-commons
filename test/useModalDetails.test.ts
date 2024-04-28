import { renderHook, act } from '@testing-library/react';
import useModalDetails from '../src/hooks/useModalDetails';

test('useModalDetails', () => {
    const { result } = renderHook(() => useModalDetails());

    act(() => {
        result.current.openModal({id:1})
    });

    expect(result.current.id).toBe(1);

})

