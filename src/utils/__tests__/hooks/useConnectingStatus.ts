import { renderHook } from '@testing-library/react-hooks'
import useConnectingStatus from '../../hooks/useConnectingStatus'

test('connecting status', () => {
    const hook = renderHook(() => useConnectingStatus())
    expect(hook.result.current).toBeFalsy()
})
