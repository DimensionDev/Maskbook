import { querySelectorAll } from '../utils/selector'

function getNParent(element: HTMLElement, n: number) {
    let p: HTMLElement = element
    for (let i = 0; i < n; i++) {
        if (!p.parentElement) return null
        p = p.parentElement
    }
    return p
}

export function injectPostImageRevealerAtTwitter(encryptedUrl: string) {
    const stripped = encryptedUrl.split('?')[0]
    const res = querySelectorAll(`img[src*="${stripped}"]`)
    res.map((element, idx, arr) => {
        const container = getNParent(element, 3)
        if (!container) return
        // TODO button to unhide
        container.style.height = "0px"
    }).evaluate()
}
