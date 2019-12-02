/* eslint-disable no-bitwise */
import { imgType } from 'node-stego/es/helper'

export function getDimension(buf: Uint8Array) {
    const fallback = {
        width: 0,
        height: 0,
    }
    switch (imgType(buf)) {
        case 'image/jpeg':
            return getDimensionAsJPEG(buf) ?? fallback
        case 'image/png':
            return getDimensionAsPNG(buf)
        default:
            return fallback
    }
}

function getDimensionAsPNG(buf: Uint8Array) {
    const dataView = new DataView(buf.buffer, 0, 28)
    return {
        width: dataView.getInt32(16),
        height: dataView.getInt32(20),
    }
}

function getDimensionAsJPEG(buf: Uint8Array) {
    const dataView = new DataView(buf.buffer)
    let i = 0
    if (
        dataView.getUint8(i) === 0xff &&
        dataView.getUint8(i + 1) === 0xd8 &&
        dataView.getUint8(i + 2) === 0xff &&
        dataView.getUint8(i + 3) === 0xe0
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
            while (i < buf.length) {
                i += block_length
                if (i >= buf.length) return
                if (dataView.getUint8(i) !== 0xff) return
                if (dataView.getUint8(i + 1) === 0xc0 || dataView.getUint8(i + 1) === 0xc2) {
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
}
