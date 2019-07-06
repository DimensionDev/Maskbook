/**
 * Parse static result from fb
 * ! TODO: This is not work in Firefox Desktop
 */
export async function parseFacebookStaticHTML(url: RequestInfo) {
    const request = await fetch(url, { credentials: 'include' })
    const text = await request.text()
    const parser = new DOMParser()
    const doc1 = parser.parseFromString(text, 'text/html')
    const codeDom = doc1.body.querySelector('code')
    if (!codeDom) return null
    const code = codeDom.innerHTML.replace('<!--', '').replace('-->', '')
    const doc2 = parser.parseFromString(code, 'text/html')
    return doc2
}
