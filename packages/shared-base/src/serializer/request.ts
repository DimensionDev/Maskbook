function is(x: any) {
    return x instanceof Request
}
function serializer(x: Request) {
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

interface SerializedRequest {
    input: string
    init: RequestInit
}

function deserializer(data: SerializedRequest) {
    return new Request(data.input, data.init)
}

/** @internal */
export const request = [is, serializer, deserializer] as const
