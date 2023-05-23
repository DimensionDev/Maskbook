import { unwrapXRayVision } from '../intrinsic_content.js'
import { contentFileFromBufferSource, defineFunctionOnContentObject } from '../utils.js'
// TODO: This file is not audited
export async function instagramUpload(url: string) {
    const result = await window.fetch(url).then((x) => x.arrayBuffer())
    const file = contentFileFromBufferSource('image/jpeg', 'image.jpg', new Uint8Array(result))

    const target = document.querySelectorAll('input')
    const postButton = document.querySelector<HTMLElement>('[data-testid="new-post-button"]')
    if (!postButton || target.length === 0) return
    const done = false
    for (const input of target) {
        defineFunctionOnContentObject(input, 'click', (_target: (...args: any) => any, thisArg, args) => {
            if (done) {
                _target.apply(thisArg, args)
            }
            const raw = unwrapXRayVision(input)
            for (const x of Object.keys(raw)) {
                // Old react for __reactEventHandlers, new for __reactProps
                if (x.startsWith('__reactEventHandlers') || x.startsWith('__reactProps')) {
                    raw[x].onChange({ target: { files: [file] } })
                }
            }
        })
    }
    postButton.click()
}
