import { Result, Err, Ok } from 'ts-results'
import { GitcoinGrantFailedReason as Reason } from './types'

export interface GitcoinGrantMetadata {
    title?: string
    description?: string
    image?: string
    width?: number
    height?: number
    finalAmount?: number
    amount?: number
    contributors?: number
    address?: string
}
const domain = 'https://gitcoin.co/'
export async function fetchMetadata(url: string): Promise<Result<GitcoinGrantMetadata, [Reason, Error?]>> {
    if (!(await browser.permissions.contains({ origins: [`${domain}*`] }))) return new Err([Reason.NoPermission])
    if (!url.startsWith(domain)) return new Err([Reason.InvalidURL])
    const data = await fetchData(url)
    if (data.err) return data.mapErr((e) => [Reason.FetchFailed, e])
    const parser = new DOMParser()
    const domTree = parser.parseFromString(data.val, 'text/html')

    const title = domTree
        .querySelector<HTMLMetaElement>('meta[name="twitter:title"]')
        ?.content.replace(/ \| Grants$/, '')
    const description = domTree.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.content
    const image = domTree.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.content
    const width = parse(domTree.querySelector<HTMLMetaElement>('meta[name="twitter:image:width"]')?.content)
    const height = parse(domTree.querySelector<HTMLMetaElement>('meta[name="twitter:image:height"]')?.content)
    const finalAmount = parse(
        [...domTree.querySelectorAll('div')]
            .find((x) =>
                [...x.childNodes].find(
                    (x) => x.nodeType === document.COMMENT_NODE && x.textContent?.includes('FUNDING AMOUNT'),
                ),
            )
            ?.querySelector('h2:nth-child(2)')?.textContent,
    )
    const [amount, contributors] = [...domTree.querySelectorAll('p')]
        .find((x) => x.innerText.match(/[0-9] contributor/))
        ?.innerText.split(' ')
        .filter((x) => !Number.isNaN(parse(x)))
        .map(parse) || [NaN, NaN]
    const address = domTree.querySelector('#wallet-address')?.textContent?.trim() ?? undefined

    return new Ok({ amount, contributors, description, finalAmount, height, image, title, width, address })
}

function fetchData(url: string) {
    return fetch(url)
        .then((x) => x.text())
        .then(
            (x) => new Ok(x),
            (e) => new Err<Error>(e),
        )
}

function parse(x: string | null | undefined) {
    if (typeof x !== 'string') return NaN
    return parseFloat(x.replace(/,/g, ''))
}
