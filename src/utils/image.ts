/* eslint-disable no-bitwise */
import { imgType } from '@dimensiondev/stego-js/cjs/helper'

export function getDimension(buf: ArrayBuffer) {
    const fallback = {
        width: 0,
        height: 0,
    }
    switch (imgType(new Uint8Array(buf))) {
        case 'image/jpeg':
            return getDimensionAsJPEG(buf) ?? fallback
        case 'image/png':
            return getDimensionAsPNG(buf)
        default:
            return fallback
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
    let i = 0
    if (
        dataView.getUint8(i) === 0xff &&
        dataView.getUint8(i + 1) === 0xd8 && // SOI marker
        dataView.getUint8(i + 2) === 0xff &&
        dataView.getUint8(i + 3) === 0xe0 // APP0 marker
    ) {
        i += 4
        if (
            dataView.getUint8(i + 2) === 'J'.charCodeAt(0) &&
            dataView.getUint8(i + 3) === 'F'.charCodeAt(0) &&
            dataView.getUint8(i + 4) === 'I'.charCodeAt(0) &&
            dataView.getUint8(i + 5) === 'F'.charCodeAt(0) &&
            dataView.getUint8(i + 6) === 0x00
        ) {
            let block_length = dataView.getUint8(i) * 256 + dataView.getUint8(i + 1)
            while (i < dataView.byteLength) {
                i += block_length
                if (i >= dataView.byteLength) return
                if (dataView.getUint8(i) !== 0xff) return
                if (
                    dataView.getUint8(i + 1) === 0xc0 || // SOF0 marker
                    dataView.getUint8(i + 1) === 0xc2 // SOF2 marker
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
        }
    }
    return
}
