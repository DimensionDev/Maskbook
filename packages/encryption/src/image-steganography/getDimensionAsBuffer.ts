import { getImageType } from '@masknet/stego-js'
import type { Dimension } from './presets.js'

/** @internal */
export function getDimensionAsBuffer(buf: ArrayBuffer): Dimension | undefined {
    switch (getImageType(new Uint8Array(buf))) {
        case 'image/jpeg':
            return getDimensionAsJPEG(buf)
        case 'image/png':
            return getDimensionAsPNG(buf)
        default:
            return
    }
}

function getDimensionAsPNG(buf: ArrayBuffer) {
    const dataView = new DataView(buf, 0, 28)
    return {
        width: dataView.getInt32(16),
        height: dataView.getInt32(20),
    }
}

/**
 * Get dimension of a JPEG image
 *
 * @see http://vip.sugovica.hu/Sardi/kepnezo/JPEG%20File%20Layout%20and%20Format.htm
 */
function getDimensionAsJPEG(buf: ArrayBuffer) {
    const dataView = new DataView(buf)
    let i = 4 // skip the first 4 bytes
    let block_length = dataView.getUint8(i) * 256 + dataView.getUint8(i + 1)

    while (i < dataView.byteLength) {
        i += block_length
        if (i >= dataView.byteLength) return
        if (dataView.getUint8(i) !== 0xff) return
        if (
            dataView.getUint8(i + 1) === 0xc0 || // 0xFFC0 is baseline standard(SOF)
            dataView.getUint8(i + 1) === 0xc1 || // 0xFFC1 is baseline optimized(SOF)
            dataView.getUint8(i + 1) === 0xc2 // 0xFFC2 is progressive(SOF2)
        ) {
            return {
                height: dataView.getUint8(i + 5) * 256 + dataView.getUint8(i + 6),
                width: dataView.getUint8(i + 7) * 256 + dataView.getUint8(i + 8),
            }
        } else {
            i += 2
            block_length = dataView.getUint8(i) * 256 + dataView.getUint8(i + 1)
        }
    }
    return
}
