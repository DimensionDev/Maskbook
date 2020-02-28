import { ValueRef } from '@holoflows/kit/es'
import { renderHook, act } from '@testing-library/react-hooks'
import { useValueRef } from '../../hooks/useValueRef'

test('update ref', async () => {
    const valueRef = new ValueRef(0)
    const hook = renderHook(() => useValueRef(valueRef))

    expect(hook.result.current).toEqual(0)
    act(() => {
        valueRef.value = 1
    })
    expect(hook.result.current).toEqual(1)
})
