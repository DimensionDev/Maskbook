import urlcat from 'urlcat'
import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { escapeRegExp } from 'lodash-unified'

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

function useScriptContent(url: string) {
    return useAsyncRetry(async () => {
        if (!url) return ''
        const response = await fetch(url)
        return response.text()
    }, [url])
}

function useScriptContentMatched(content: string, regexp: RegExp) {
    return useMemo(() => {
        if (!content) return
        const [, matched] = content.match(regexp) ?? []
        return matched
    }, [content, regexp])
}

function useCSRFToken() {
    return useMemo(() => {
        const ct0 = document.cookie.split('; ').find((x) => x.includes('ct0'))
        if (!ct0) return ''
        const [, value] = ct0.split('=')
        return value
    }, [])
}

export function useNFTContainerAtTwitter(screenName: string) {
    const { value: swContent } = useScriptContent('https://twitter.com/sw.js')
    const { value: mainContent } = useScriptContent(getScriptURL(swContent ?? '', 'main'))
    const { value: nftContent } = useScriptContent(getScriptURL(swContent ?? '', 'bundle.UserNft'))

    const bearerToken = useScriptContentMatched(mainContent ?? '', /s="(\w+%3D\w+)"/)
    const queryToken = useScriptContentMatched(nftContent ?? '', /{\s?id:\s?"([\w-]+)"/)
    const csrfToken = useCSRFToken()

    return useAsyncRetry(async () => {
        if (!bearerToken || !queryToken || !csrfToken) return
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
    }, [bearerToken, csrfToken, queryToken, screenName])
}
