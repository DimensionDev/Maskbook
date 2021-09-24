import type { InternalEvents } from '../../shared'
import { no_xray_Event } from '../intrinsic'
import { clone_into, constructXrayUnwrappedFilesFromUintLike } from '../utils'
import { dispatchEventRaw } from './capture'

const proto = HTMLInputElement.prototype
const { defineProperty, deleteProperty } = Reflect
const timeout = setTimeout.bind(window)
export function hookInputUploadOnce(...[format, fileName, fileArray]: InternalEvents['hookInputUploadOnce']) {
    const e = new no_xray_Event('change', {
        bubbles: true,
        cancelable: true,
    })
    const file = constructXrayUnwrappedFilesFromUintLike(format, fileName, fileArray)

    const old = proto.click
    proto.click = function (this: HTMLInputElement) {
        const fileList: Partial<FileList> = clone_into({
            item: clone_into((i) => {
                if (i === 0) return file
                return null
            }),
            length: 1,
            [0]: file,
        })
        defineProperty(this, 'files', {
            configurable: true,
            value: fileList,
        })
        dispatchEventRaw(this, e, {})
        proto.click = old
        timeout(() => {
            deleteProperty(this, 'files')
        }, 200)
    }
}
