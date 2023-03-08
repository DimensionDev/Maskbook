import { memoize } from 'lodash-es'
import { sha3 } from 'web3-utils'

function createCanvasFingerprint() {
    if (process.env.NODE_ENV === 'test') return ''

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) return ''

    context.fillStyle = 'rgb(255,0,255)'
    context.beginPath()
    context.rect(20, 20, 150, 100)
    context.fill()
    context.stroke()
    context.closePath()
    context.beginPath()
    context.fillStyle = 'rgb(0,255,255)'
    context.arc(50, 50, 50, 0, Math.PI * 2, true)
    context.fill()
    context.stroke()
    context.closePath()
    context.textBaseline = 'top'
    context.font = '17px "Arial 17"'
    context.textBaseline = 'alphabetic'
    context.fillStyle = 'rgb(255,5,5)'
    context.rotate(0.03)
    context.fillText('mask9é0#マスクfbz1마스크$%^@£éú面具', 4, 17)
    context.fillStyle = 'rgb(155,255,5)'
    context.shadowBlur = 8
    context.shadowColor = 'red'
    context.fillRect(20, 12, 100, 5)

    return canvas.toDataURL()
}

/**
 * The constant fingerprint of device.
 * @returns
 */
export const createDeviceFingerprint: ReturnType<typeof memoize> = memoize((): string => {
    return (
        sha3(
            [
                createCanvasFingerprint(),
                navigator.userAgent,
                navigator.language,
                navigator.maxTouchPoints,
                navigator.hardwareConcurrency,
                screen.availWidth,
                screen.availHeight,
                screen.pixelDepth,
            ].join(),
        ) ?? ''
    )
})
