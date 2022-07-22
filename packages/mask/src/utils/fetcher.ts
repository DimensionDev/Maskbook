import Services from '../extension/service'
/// <reference lib="@masknet/global-types/firefox" />

const { fetch: original_fetch } = globalThis
export function contentFetch(input: RequestInfo, init?: RequestInit) {
    const info = new Request(input, init)

    if (isSameOrigin(info.url)) {
        if (process.env.engine === 'firefox' && process.env.manifest === '2' && typeof content === 'object') {
            return content.fetch(info)
        } else {
            return original_fetch(info)
        }
    }

    return Services.Helper.r2d2Fetch(info)
}

function isSameOrigin(url: string) {
    return new URL(url, location.href).origin === location.origin
}
