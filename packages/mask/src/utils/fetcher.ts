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

    return Services.Helper.r2d2Fetch(info, init)
}

function isSameOrigin(url: string) {
    return new URL(url, location.href).origin === location.origin
}
