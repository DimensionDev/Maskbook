import { TypesonPromise } from 'typeson'

export const is = (x: any) => x instanceof Response
export const ser = (x: Response) => {
    return new TypesonPromise<{ binaryArray: Uint8Array[]; init: ResponseInit }>(async (resolve, reject) => {
        const reader = x.body?.getReader()
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
        resolve({
            binaryArray: output,
            init: {
                status: x.status,
                statusText: x.statusText,
                headers: { 'Content-Type': 'application/json' },
            },
        })
    })
}

export const de = (x: { binaryArray: Uint8Array[]; init: ResponseInit }) => {
    const body = new ReadableStream({
        start(controller) {
            for (const binary of x.binaryArray) {
                controller.enqueue(binary)
            }
            controller.close()
        },
    })
    return new Response(body, x.init)
}
