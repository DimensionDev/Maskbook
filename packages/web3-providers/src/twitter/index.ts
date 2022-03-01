import { escapeRegExp } from 'lodash-unified'
import urlcat from 'urlcat'
import type { TwitterBaseAPI } from '../types'

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

function getScriptContentMatched(content: string, regexp: RegExp) {
    const [, matched] = content.match(regexp) ?? []
    return matched
}

function getCSRFToken() {
    const ct0 = document.cookie.split('; ').find((x) => x.includes('ct0'))
    if (!ct0) return ''
    const [, value] = ct0.split('=')
    return value
}

async function getScriptContent(url: string) {
    const response = await fetch(url)
    return response.text()
}

async function getUserNftContainer(
    screenName: string,
    queryToken: string,
    bearerToken: string,
    csrfToken: string,
): Promise<{
    data: {
        user: {
            result: TwitterBaseAPI.NFTContainer
        }
    }
}> {
    const response = await fetch(
        urlcat(
            `https://twitter.com/i/api/graphql/:queryToken/userNftContainer_Query?variables=${encodeURIComponent(
                JSON.stringify({
                    screenName,
                }),
            )}`,
            {
                queryToken,
            },
        ),
        {
            headers: {
                authorization: `Bearer ${bearerToken}`,
                'x-csrf-token': csrfToken,
                'content-type': 'application/json',
                'x-twitter-auth-type': 'OAuth2Session',
                'x-twitter-active-user': 'yes',
                referer: `https://twitter.com/${screenName}/nft`,
            },
        },
    )
    return response.json()
}

async function getTokens() {
    const swContent = await getScriptContent('https://twitter.com/sw.js')
    const mainContent = await getScriptContent(getScriptURL(swContent ?? '', 'main'))
    const nftContent = await getScriptContent(getScriptURL(swContent ?? '', 'bundle.UserNft'))

    const bearerToken = getScriptContentMatched(mainContent ?? '', /s="(\w+%3D\w+)"/)
    const queryToken = getScriptContentMatched(nftContent ?? '', /{\s?id:\s?"([\w-]+)"/)
    const csrfToken = getCSRFToken()

    return {
        bearerToken,
        queryToken,
        csrfToken,
    }
}

export class TwitterAPI implements TwitterBaseAPI.Provider {
    async getUserNftContainer(
        screenName: string,
    ): Promise<{ address: string; token_id: string; type_name: string } | undefined> {
        const { bearerToken, queryToken, csrfToken } = await getTokens()
        if (!bearerToken || !queryToken || !csrfToken) return
        const result = await getUserNftContainer(screenName, queryToken, bearerToken, csrfToken)
        if (!result?.data?.user?.result?.has_nft_avatar) return
        return {
            address: result.data.user.result.nft_avatar_metadata.smart_contract.address,
            token_id: result.data.user.result.nft_avatar_metadata.token_id,
            type_name: result.data.user.result.nft_avatar_metadata.smart_contract.__typename,
        }
    }
}
