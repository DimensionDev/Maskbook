/**
 * Parse static result from fb
 * ! TODO: This is not work in Firefox Desktop
 */
export async function parseFacebookStaticHTML(url: RequestInfo) {
    const request = await fetch(url, { credentials: 'include' })
    const text = await request.text()
    const parser = new DOMParser()
    const doc1 = parser.parseFromString(text, 'text/html')
    const codeDom = doc1.body.querySelector<HTMLElement>('code')
    const rootDom = doc1.body.querySelector<HTMLDivElement>('#root')
    if (codeDom) {
        return parser.parseFromString(codeDom.innerHTML.replace('<!--', '').replace('-->', ''), 'text/html')
    }

    // <code /> node is absent in old version profile page since use timeline node instead
    if (rootDom) return rootDom
    return null
}
