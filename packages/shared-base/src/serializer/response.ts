import { TypesonPromise } from 'typeson'

export const is = (x: any) => x instanceof Response
export const serializer = (x: Response) => {
    return new TypesonPromise<{
        body: Blob
        init: ResponseInit
    }>(async (resolve) => {
        const bodyBlob = await x.blob()
        resolve({
            body: bodyBlob,
            init: {
                status: x.status,
                statusText: x.statusText,
                headers: x.headers,
            },
        })
    })
}

export const deserializer = (x: { body: Blob; init: ResponseInit }) => {
    return new Response(x.body, x.init)
}

export const responseSerializer = [is, serializer, deserializer] as const
