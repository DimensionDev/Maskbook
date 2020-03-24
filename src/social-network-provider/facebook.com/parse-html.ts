/**
 * Parse static result from fb
 */
export function parseFacebookStaticHTML(html: string): (HTMLElement | Document)[] {
    const parser = new DOMParser()
    const doc1 = parser.parseFromString(html, 'text/html')
    const codeDom = doc1.body.querySelector<HTMLElement>('code')
    const rootDom = doc1.body.querySelector<HTMLDivElement>('#root')
    if (codeDom) {
        const nodes = Array.from(doc1.body.querySelectorAll('code'))
            .map((x) => {
                const comment = x.childNodes[0]
                if (!comment) return null
                return parser.parseFromString(comment.textContent || '', 'text/html')
            })
            .filter((x) => x)
        return nodes as Document[]
    }

    // <code /> node is absent in old version profile page since use timeline node instead
    if (rootDom) return [rootDom]
    return []
}
