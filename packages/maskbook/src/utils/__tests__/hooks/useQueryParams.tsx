import { BrowserRouter } from 'react-router-dom'
import { renderHook } from '@testing-library/react-hooks'
import { useQueryParams } from '../../hooks/useQueryParams'

function BrowserRouterWrapper({ children }: { children?: React.ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>
}
test.only('browser router', () => {
    history.replaceState({}, 'test', '/test')
    expect(renderHook(() => useQueryParams([]), { wrapper: BrowserRouterWrapper }).result.current).toEqual({})

    history.replaceState({}, 'test', '/test?a=a&b=1')
    expect(renderHook(() => useQueryParams(['a', 'b']), { wrapper: BrowserRouterWrapper }).result.current).toEqual({
        a: 'a',
        b: '1',
    })
})
