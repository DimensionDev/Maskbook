import { escapeRegExp } from 'lodash-es'
import { squashPromise } from '@masknet/web3-shared-base'
import { fetchText } from '../../helpers/fetchText.js'

function getScriptURL(content: string, name: string) {
    const matchURL = new RegExp(
        `https://abs.twimg.com/responsive-web/(client-web|client-web-\\w+){1}/${escapeRegExp(
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
    return fetchText(url)
}

function getAPIScriptURL(content: string) {
    const matches = content.match(/api:"(\w+)",/)
    if (!matches) return
    return `https://abs.twimg.com/responsive-web/client-web/api.${matches[1]}a.js`
}

async function getScripts() {
    const indexContent = await fetchContent('https://twitter.com')
    const swContent = await fetchContent('https://twitter.com/sw.js')

    const allSettled = await Promise.allSettled([
        fetchContent(getScriptURL(indexContent ?? '', 'main')),
        fetchContent(getScriptURL(swContent ?? '', 'main')),
        fetchContent(getScriptURL(swContent ?? '', 'bundle.UserNft')),
        fetchContent(getAPIScriptURL(indexContent ?? '')),
    ])
    const [mainContentPrimary, mainContentSecondary, userNFT_Content, API_Content] = allSettled.map((x) =>
        x.status === 'fulfilled' ? x.value ?? '' : '',
    )

    return {
        mainContent: mainContentPrimary || mainContentSecondary,
        userNFT_Content,
        API_Content,
    }
}

const getScriptSquashed = squashPromise('GET_TWITTER_SCRIPTS', getScripts, 60_000)

export async function getTokens(operationName?: string) {
    const { mainContent, userNFT_Content, API_Content } = await getScriptSquashed()
    const bearerToken = getScriptContentMatched(mainContent ?? '', /"(\w{20,}%3D\w{20,})"/)
    const queryToken = getScriptContentMatched(userNFT_Content ?? '', /{\s?id:\s?"([\w-]+)"/)
    const csrfToken = getCSRFToken()
    const queryId = operationName
        ? getScriptContentMatched(API_Content ?? '', new RegExp(`queryId:"([^"]+)",operationName:"${operationName}"`))
        : undefined

    return {
        bearerToken,
        queryToken,
        csrfToken,
        queryId,
    }
}

export async function getHeaders(overrides?: Record<string, string>) {
    const { bearerToken, csrfToken } = await getTokens()

    return {
        authorization: `Bearer ${bearerToken}`,
        'x-csrf-token': csrfToken,
        'x-twitter-auth-type': 'OAuth2Session',
        referer: 'https://twitter.com/',
        ...overrides,
    }
}
