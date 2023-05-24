import { $, $safe } from '../intrinsic.js'
import { PatchDescriptor, contentFileFromBufferSource } from '../utils.js'
import { __FileList } from './DataTransfer.js'
import { __Event, DispatchEvent } from './Event.js'

let replaceAction: ((thisVal: HTMLElement) => void) | undefined
let replaceFiles: FileList | undefined
function click(this: HTMLElement) {
    if (replaceAction) return replaceAction(this)
    return $.HTMLElementPrototype_click(this)
}
function files_getter(this: HTMLInputElement) {
    const originalFiles = $.HTMLInputElementPrototype_files_get(this)
    return replaceFiles || originalFiles
}
function files_setter(this: HTMLInputElement, value: FileList | null) {
    $.HTMLInputElementPrototype_files_set(this, value)
    replaceFiles = undefined
}
PatchDescriptor(
    {
        __proto__: null!,
        files: { get: files_getter, set: files_setter },
    },
    $.HTMLInputElementPrototype,
)
PatchDescriptor(
    {
        __proto__: null!,
        click: { value: click },
    },
    $.HTMLElementPrototype,
)

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

    function action(thisVal: HTMLElement) {
        replaceAction = undefined
        const file = contentFileFromBufferSource(format, fileName, fileArray)
        const fileList = new __FileList([file])
        replaceFiles = fileList
        $.setTimeout(() => {
            const event = new __Event('change', { bubbles: true })
            DispatchEvent(thisVal, event)
        }, 200)
    }
    replaceAction = action

    if (triggerOnActiveElementNow) {
        const element = $.DocumentActiveElement()
        if (element) replaceAction(element as HTMLElement)
    }
}
