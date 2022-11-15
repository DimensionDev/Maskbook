import { escapeRegExp } from 'lodash-es'
import urlcat from 'urlcat'
import LRUCache from 'lru-cache'
import type { TwitterBaseAPI } from '../../types/index.js'

const scriptCache = new LRUCache<string, Promise<Response> | string>({
    max: 10,
    ttl: 300_000,
})

function getScriptURL(content: string, name: string) {
    const matchURL = new RegExp(
        `https://abs.twimg.com/responsive-web/\(client-web|client-web-\\w+\)\{1\}/${escapeRegExp(
            `${name}.`,
        )}\\w+${escapeRegExp('.js')}`,
        'm',
    )
    const [url] = content.match(matchURL) ?? []
    return url
}

function getCSRFToken() {
    const ct0 = document.cookie.split('; ').find((x) => x.includes('ct0'))
    if (!ct0) return ''
    const [, value] = ct0.split('=')
    return value
}

function getScriptContentMatched(content: string, pattern: RegExp) {
    const [, matched] = content.match(pattern) ?? []
    return matched
}

async function fetchContent(url?: string) {
    if (!url) return

    const hit: Promise<Response> = scriptCache.get(url) ?? fetch(url)

    if (scriptCache.get(url) !== hit) scriptCache.set(url, hit)

    if (typeof hit === 'string') return hit

    const response = (await hit).clone()
    if (!response.ok) {
        scriptCache.delete(url)
        return
    }
    const content = await response.text()
    scriptCache.set(url, content)
    return content
}

export async function getTokens(operationName?: string) {
    const swContent = await fetchContent('https://twitter.com/sw.js')
    if (!swContent) throw new Error('Failed to fetch manifest script.')

    const [mainContent, nftContent] = await Promise.all([
        fetchContent(getScriptURL(swContent, 'main')),
        fetchContent(getScriptURL(swContent, 'bundle.UserNft')),
    ])

    const bearerToken = getScriptContentMatched(mainContent ?? '', /,\w="(\w{20,}%3D\w{20,})",/)
    const queryToken = getScriptContentMatched(nftContent ?? '', /{\s?id:\s?"([\w-]+)"/)
    const csrfToken = getCSRFToken()
    const queryId = operationName
        ? getScriptContentMatched(mainContent ?? '', new RegExp(`queryId:"([^"]+)",operationName:"${operationName}"`))
        : undefined

    return {
        bearerToken,
        queryToken,
        csrfToken,
        queryId,
    }
}