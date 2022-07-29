import Services from '../extension/service'

const { fetch: original_fetch } = globalThis
export function contentFetch(input: RequestInfo, init?: RequestInit) {
    const info = new Request(input, init)

    if (isSameOrigin(info.url)) {
        if (process.env.engine === 'firefox' && process.env.manifest === '2' && typeof content === 'object') {
            return content.fetch(info, init)
        } else {
            return original_fetch(info, init)
        }
    }

    const signal = init?.signal
    if (init) delete init.signal
    return Services.Helper.r2d2Fetch(info, init).then((response) => {
        signal?.throwIfAborted()
        return response
    })
}

function isSameOrigin(url: string) {
    return new URL(url, location.href).origin === location.origin
}
