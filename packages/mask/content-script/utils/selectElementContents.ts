/**
 * Select all text in a node
 * @param el Element
 */

export function selectElementContents(el: Node) {
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = globalThis.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
    return sel
}
