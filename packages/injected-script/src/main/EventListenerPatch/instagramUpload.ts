import type { InternalEvents } from '../../shared'
import { constructXrayUnwrappedFilesFromUintLike, overwriteFunctionOnXRayObject, unwrapXRay_DOMObject } from '../utils'
// TODO: This file is not audited
export async function instagramUpload(url: InternalEvents['instagramUpload'][0]) {
    const result = await window.fetch(url).then((x) => x.arrayBuffer())
    const file = constructXrayUnwrappedFilesFromUintLike('image/jpeg', 'image.jpg', new Uint8Array(result))

    const target = document.querySelectorAll('input')
    const postButton = document.querySelector<HTMLElement>('[data-testid="new-post-button"]')
    if (!postButton || target.length === 0) return
    const done = false
    for (const input of target) {
        overwriteFunctionOnXRayObject(input, 'click', (_target: Function, thisArg, args) => {
            if (done) {
                _target.apply(thisArg, args)
            }
            const raw = unwrapXRay_DOMObject(input)
            for (const x of Object.keys(raw)) {
                // Old react for __reactEventHandlers, new for __reactProps
                if (x.startsWith('__reactEventHandlers') || x.startsWith('__reactProps')) {
                    ;(raw as any)[x].onChange({ target: { files: [file] } })
                }
            }
        })
    }
    postButton.click()
}
