import { TypesonPromise } from 'typeson'

interface IR {
    body: Blob | ReadableStream | null
    init: ResponseInit
}
function is(x: any) {
    return x instanceof Response
}
function serializer(response: Response) {
    return new TypesonPromise<IR>((resolve, reject) => {
        response.blob().then((body) => {
            resolve({
                body,
                init: {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                },
            })
        }, reject)
    })
}
function streamSerializer(response: Response): IR {
    return {
        body: response.body,
        init: {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        },
    }
}

function deserializer(response: IR) {
    return new Response(response.body, response.init)
}

/** @internal */
export const response = [is, serializer, deserializer] as const
/** @internal */
export const streamResponse = [is, streamSerializer, deserializer] as const
