import { escapeRegExp } from 'lodash-es'
import { fetchCache } from '../../helpers.js'

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

    const response = await fetchCache(url)
    if (!response.ok) return

    return response.text()
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
