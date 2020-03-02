import { iOSHost } from '../iOS-RPC'

const JSON_RPC_KEY = 'maskbookjsonrpc'

// async-call-rpc use Math.random generate rpc id
beforeAll(() => {
    ;(Math as any)._random = Math.random
})

afterAll(() => {
    Math.random = (Math as any)._random
    delete (Math as any)._random
})

function hijackRandomId() {
    const num = Math.random()
    const id = num.toString(36).slice(2)

    Math.random = () => num
    return id
}

function delayResponse(id: string, result: unknown, delay = 500) {
    setTimeout(() => {
        document.dispatchEvent(
            new CustomEvent(JSON_RPC_KEY, {
                detail: {
                    id,
                    result,
                    jsonrpc: '2.0',
                },
            }),
        )
    }, delay)
}

test('scan QR code', async () => {
    const id = hijackRandomId()
    delayResponse(id, 'text')
    await expect(iOSHost.scanQRCode()).resolves.toEqual('text')
})

test('log', async () => {
    // @ts-ignore
    const postMessageSpy = spyOn(globalThis.webkit.messageHandlers[JSON_RPC_KEY], 'postMessage')
    const id = hijackRandomId()

    delayResponse(id, undefined)
    await expect(iOSHost.log(1, 2, 3)).resolves.toBeUndefined()
    expect(postMessageSpy).toHaveBeenCalled()

    const data = postMessageSpy.calls.first().args[0]
    expect(data.id).toEqual(id)
    expect(data.method).toEqual('log')
    expect(data.params).toEqual([1, 2, 3])
})
