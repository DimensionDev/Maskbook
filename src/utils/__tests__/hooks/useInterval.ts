import { renderHook } from '@testing-library/react-hooks'
import { useInterval } from '../../hooks/useInterval'
import { sleep } from '../../utils'

test('set timer', async () => {
    const callbackSpy = jasmine.createSpy()

    renderHook(() => useInterval(callbackSpy, 100))
    await sleep(500)
    expect(callbackSpy).toHaveBeenCalled()
})
