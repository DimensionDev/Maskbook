import { $, $safe, $unsafe } from '../intrinsic.js'
import { contentFileFromBufferSource } from '../utils.js'
import { __Event, DispatchEvent } from './Event.js'

const proto = HTMLInputElement.prototype

/**
 * This API can mock a file upload in React applications when injected script has been injected into the page.
 *
 * If the <input type='file' /> element is available, you can use the API like this:
 *     input.focus()
 *     hookInputUploadOnce(format, fileName, file, true)
 *
 * If the <input type='file' /> is dynamically generated after the user clicks "Upload" button on the web page, you can use the API like this:
 *     hookInputUploadOnce(format, fileName, file, false)
 *     uploadButton.click()
 * @param format
 * @param fileName
 * @param fileArray
 * @param triggerOnActiveElementNow
 */
export function hookInputUploadOnce(
    format: string,
    fileName: string,
    fileArray: number[],
    triggerOnActiveElementNow: boolean,
) {
    $.setPrototypeOf(fileArray, $safe.ArrayPrototype)

    let timer: number | null = null
    const event = new __Event('change', { bubbles: true })
    const file = contentFileFromBufferSource(format, fileName, fileArray)

    const old = proto.click
    proto.click = function (this: HTMLInputElement) {
        const fileList: Partial<FileList> = $.cloneIntoContent({
            item: $.cloneIntoContent((i: number) => {
                if (i === 0) return file
                return null
            }),
            length: 1,
            [0]: file,
        })
        $.defineProperty(this, 'files', {
            configurable: true,
            value: fileList,
        })
        if (timer !== null) $unsafe.clearTimeout(timer)
        timer = $unsafe.setTimeout(() => {
            DispatchEvent(this, event)
            proto.click = old
            $.deleteProperty(this, 'files')
        }, 200)
    }

    const element = $.DocumentActiveElement()
    if (triggerOnActiveElementNow && element) {
        $.HTMLElement_click(element as HTMLElement)
    }
}
