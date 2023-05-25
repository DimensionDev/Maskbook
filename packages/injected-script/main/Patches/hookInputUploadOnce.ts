import { $, $safe } from '../intrinsic.js'
import { PatchDescriptor, PatchDescriptor_NonNull, contentFileFromBufferSource } from '../utils.js'
import { __FileList } from './DataTransfer.js'
import { __Event, DispatchEvent } from './Event.js'

export const HTMLElementClickReplaceAction = $safe.WeakMap<HTMLElement, (thisVal: HTMLElement) => void>()
let defaultReplaceAction: ((thisVal: HTMLElement) => void) | undefined
let replaceFiles: FileList | undefined
function click(this: HTMLElement) {
    if (HTMLElementClickReplaceAction.has(this)) return HTMLElementClickReplaceAction.get(this)!(this)
    if (defaultReplaceAction) return defaultReplaceAction(this)
    return $.HTMLElementPrototype_click(this)
}
const HTMLInputElementPatch = {
    get files() {
        const originalFiles = $.HTMLInputElementPrototype_files_get(this as HTMLInputElement)
        return replaceFiles || originalFiles
    },
    set files(value: FileList | null) {
        $.HTMLInputElementPrototype_files_set(this as HTMLInputElement, value)
        replaceFiles = undefined
    },
}
PatchDescriptor_NonNull($.getOwnPropertyDescriptors(HTMLInputElementPatch), $.HTMLInputElementPrototype)
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
        defaultReplaceAction = undefined
        const file = contentFileFromBufferSource(format, fileName, fileArray)
        const fileList = new __FileList([file])
        replaceFiles = fileList
        $.setTimeout(() => {
            const event = new __Event('change', { bubbles: true })
            DispatchEvent(thisVal, event)
        }, 200)
    }
    defaultReplaceAction = action

    if (triggerOnActiveElementNow) {
        const element = $.DocumentActiveElement()
        if (element) defaultReplaceAction(element as HTMLElement)
    }
}
