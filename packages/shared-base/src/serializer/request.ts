export const is = (x: any) => x instanceof Request
export const serializer = (x: Request) => {
    const { url, method, body, headers, mode, credentials, cache, redirect, referrer, integrity } = x
    return {
        input: url,
        init: {
            method,
            // body maybe is a Blob, a BufferSource, a FormData, a URLSearchParams, a string, or a ReadableStream object, should handle different object type later
            body,
            headers,
            mode,
            credentials,
            cache,
            redirect,
            referrer,
            integrity,
        },
    }
}

export const deserializer = (x: { input: string; init: RequestInit }) => {
    return new Request(x.input, x.init)
}

export const requestSerializer = [is, serializer, deserializer] as const
