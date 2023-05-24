import { $, $safe, $unsafe } from '../intrinsic.js'
import { contentFileFromBufferSource } from '../utils.js'
import { HTMLElementClickReplaceAction } from './hookInputUploadOnce.js'
export async function instagramUpload(img: number[]) {
    $.setPrototypeOf(img, $safe.ArrayPrototype)
    const file = contentFileFromBufferSource('image/jpeg', 'image.jpg', $.Uint8Array_from(img))

    const target = $.querySelectorAll(document, 'input')
    const postButton = $.querySelector(document, '[data-testid="new-post-button"]')
    if (!postButton || target.length === 0) return

    $.NodeList_forEach(target, (input) => {
        HTMLElementClickReplaceAction.set(input as HTMLInputElement, () => {
            const __unsafe__input = $unsafe.unwrapXRayVision(input)

            for (const key in __unsafe__input) {
                if (!$.hasOwn(__unsafe__input, key)) continue
                if ($.StringStartsWith(key, '__reactEventHandlers') || $.StringStartsWith(key, '__reactProps')) {
                    // @ts-expect-error extra prop
                    const reactState: any = __unsafe__input[key]
                    reactState.onChange($unsafe.structuredCloneFromSafe({ target: { files: [file] } }))
                }
            }
        })
        $.setTimeout(() => HTMLElementClickReplaceAction.delete(input as HTMLInputElement), 500)
    })
    $.HTMLElementPrototype_click(postButton as HTMLElement)
}
