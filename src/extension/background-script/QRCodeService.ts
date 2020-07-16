import { sideEffect } from '../../utils/side-effects'
import { getUrl } from '../../utils/utils'
import { isNull } from 'lodash-es'
import { QRCodeRenderersOptions, toCanvas } from 'qrcode'

let worker: Worker
sideEffect.then(() => {
    worker = new Worker(getUrl('js/qrcode.js'))
})

export function encode(message: string, options?: QRCodeRenderersOptions) {
    const canvas = document.createElement('canvas')
    return new Promise((resolve, reject) => {
        toCanvas(canvas, message, options ?? {}, (error: Error) => {
            if (error) reject(error)
            else resolve(canvas.toDataURL())
        })
    })
}

export function decode({ data, width, height }: { data: number[]; width: number; height: number }) {
    return new Promise<string | undefined>((resolve) => {
        worker.postMessage([data, width, height])
        worker.onmessage = (ev: MessageEvent) => resolve(isNull(ev.data) ? undefined : ev.data.data)
        worker.onerror = (err: ErrorEvent) => resolve(undefined)
    })
}
