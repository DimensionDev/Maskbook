import { renderHook } from '@testing-library/react-hooks'
import { useQueryNavigatorPermission, checkPermissionApiUsability } from '../../hooks/useQueryNavigatorPermission'

const q = <const>['query', 'request', 'revoke']

function redefineApi(type: typeof q[number], attributes: PropertyDescriptor) {
    Object.defineProperty(navigator.permissions, type, attributes)
}

beforeEach(() => {
    Object.defineProperty(navigator, 'permissions', {
        value: {},
        writable: true,
    })
})

afterEach(() => {
    Object.defineProperty(navigator, 'permissions', {})
})

test('check permission api usability', () => {
    redefineApi('query', { value() {} })
    expect(checkPermissionApiUsability('query')).toBeTruthy()
    expect(checkPermissionApiUsability('request')).toBeFalsy()
    expect(checkPermissionApiUsability()).toStrictEqual({
        query: true,
        request: false,
        revoke: false,
    })
})

test('request camera permission without permissions api', () => {
    expect(renderHook(() => useQueryNavigatorPermission(true, 'camera')).result.current).toEqual('granted')
})

for (const api of q) {
    if (api === 'revoke') {
        continue
    }
    test(`invoke ${api} permission api succeeded`, async () => {
        redefineApi(api, {
            value() {
                return Promise.resolve({
                    state: 'granted',
                })
            },
        })

        const hook = renderHook(() => useQueryNavigatorPermission(true, 'camera'))
        expect(hook.result.current).toEqual('prompt')
        await hook.waitForNextUpdate()
        expect(hook.result.current).toEqual('granted')
    })

    test(`invoke ${api} permission api failed`, async () => {
        redefineApi(api, {
            value() {
                return Promise.reject(new Error('denied'))
            },
        })

        const hook = renderHook(() => useQueryNavigatorPermission(true, 'camera'))
        expect(hook.result.current).toEqual('prompt')
        await hook.waitForNextUpdate()
        expect(hook.result.current).toEqual('granted')
    })
}

test('permission api not available', async () => {
    const hook = renderHook(() => useQueryNavigatorPermission(true, 'camera'))
    expect(hook.result.current).toEqual('granted')
})

test('remove onchange listener', async () => {
    const onChangeSpy = jasmine.createSpy()
    redefineApi('query', {
        value() {
            return Promise.resolve(
                new Proxy(
                    {
                        state: 'granted',
                        onchange: null,
                    },
                    {
                        set(target, key, value) {
                            onChangeSpy(value)
                            return Reflect.set(target, key, value, target)
                        },
                    },
                ),
            )
        },
    })

    const hook = renderHook(() => useQueryNavigatorPermission(true, 'camera'))
    await hook.waitForNextUpdate()
    hook.unmount()

    expect(typeof onChangeSpy.calls.argsFor(0)[0]).toEqual('function')
    expect(onChangeSpy.calls.argsFor(1)).toEqual([null])
})
