import { renderHook } from '@testing-library/react-hooks'
import { useAsync } from '../../hooks/useAsync'

function wait(delay: number) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

test('fast fullfill', async () => {
    const thenable = renderHook(() => useAsync(() => Promise.resolve(0), [])).result.current
    expect(await thenable).toBe(0)
})

test('fast reject', async () => {
    const thenable = renderHook(() => useAsync(() => Promise.reject(new Error('reject')), [])).result.current
    try {
        await thenable
    } catch (e) {
        expect(e).toEqual(new Error('reject'))
    }
})

test('slow fulfill', async () => {
    const thenable = renderHook(() =>
        useAsync(async () => {
            await wait(100)
            return 0
        }, []),
    ).result.current
    expect(await thenable).toBe(0)
})

test('slow reject', async () => {
    const thenable = renderHook(() =>
        useAsync(async () => {
            await wait(100)
            throw new Error('reject')
        }, []),
    ).result.current
    try {
        await thenable
    } catch (e) {
        expect(e).toEqual(new Error('reject'))
    }
})
