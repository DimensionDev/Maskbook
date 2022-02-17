import { escapeRegExp } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import urlcat from 'urlcat'

interface NFTContainer {
    has_nft_avatar: boolean
    nft_avatar_metadata: AvatarMetadata
}

interface AvatarMetadata {
    token_id: string
    smart_contract: {
        __typename: 'ERC721' | 'ERC1155'
        __isSmartContract: 'ERC721'
        network: 'Ethereum'
        address: string
    }
    metadata: {
        creator_username: string
        creator_address: string
        name: string
        description?: string
        collection: {
            name: string
            metadata: {
                image_url: string
                verified: boolean
                description: string
                name: string
            }
        }
        traits: {
            trait_type: string
            value: string
        }[]
    }
}

function getScriptURL(content: string, name: string) {
    const matchURL = new RegExp(
        `${escapeRegExp(`https://abs.twimg.com/responsive-web/client-web/${name}.`)}\\w+${escapeRegExp('.js')}`,
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
            result: NFTContainer
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
    return response.json() as Promise<{
        data: {
            user: {
                result: NFTContainer
            }
        }
    }>
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

export async function getNFTContainerAtTwitter(screenName: string) {
    const { bearerToken, queryToken, csrfToken } = await getTokens()
    if (!bearerToken || !queryToken || !csrfToken) return ''
    const result = await getUserNftContainer(screenName, bearerToken, queryToken, csrfToken)
    if (!result?.data?.user?.result?.has_nft_avatar) return ''
    return result?.data?.user?.result?.nft_avatar_metadata.smart_contract.address
}

export function useNFTContainerAtTwitter(screenName: string): AsyncState<{ address: string; token_id: string }> {
    return useAsyncRetry(async () => {
        const { bearerToken, queryToken, csrfToken } = await getTokens()
        if (!bearerToken || !queryToken || !csrfToken) return
        const result = await getUserNftContainer(screenName, bearerToken, queryToken, csrfToken)
        if (!result?.data?.user?.result?.has_nft_avatar) return
        return {
            address: result.data.user.result.nft_avatar_metadata.smart_contract.address,
            token_id: result.data.user.result.nft_avatar_metadata.token_id,
        }
    }, [getTokens, screenName])
}
