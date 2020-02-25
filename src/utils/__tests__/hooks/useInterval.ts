import { renderHook } from '@testing-library/react-hooks'
import { useInterval } from '../../hooks/useInterval'

function wait(delay: number) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

test('set timer', async () => {
    const callbackSpy = jasmine.createSpy()

    renderHook(() => useInterval(callbackSpy, 100))
    await wait(500)
    expect(callbackSpy).toHaveBeenCalled()
})
