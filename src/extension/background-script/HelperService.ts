export async function resolveTCOLink(u: string) {
    if (!u.startsWith('https://t.co/')) return null
    const req = await globalThis.fetch(u, {
        redirect: 'error',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
    })
    const text = await req.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/html')
    const dom = doc.querySelector('noscript > meta') as HTMLMetaElement
    if (!dom) return null
    const [, url] = dom.content.split('URL=')
    return url ?? null
}

export function fetch(url: string) {
    return globalThis.fetch(url).then((x) => x.arrayBuffer())
}
