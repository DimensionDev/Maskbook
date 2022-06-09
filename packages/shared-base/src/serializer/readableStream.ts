import { TypesonPromise } from 'typeson'

export const is = (x: any) => x instanceof ReadableStream

export const serializer = (x: ReadableStream) => {
    return new TypesonPromise<Uint8Array[]>(async (resolve, reject) => {
        const reader = x.getReader()
        const output = []
        let isDone = false
        if (reader) {
            try {
                while (!isDone) {
                    const { done, value } = await reader.read()
                    if (!done) {
                        output.push(value)
                    } else {
                        isDone = true
                    }
                }
            } catch (error) {
                reject(error)
            }
        }
        resolve(output)
    })
}

export const deserializer = (x: Uint8Array[]) => {
    return new ReadableStream({
        start(controller) {
            for (const binary of x) {
                controller.enqueue(binary)
            }
            controller.close()
        },
    })
}

export const readableStreamRegedit = [is, serializer, deserializer] as const
