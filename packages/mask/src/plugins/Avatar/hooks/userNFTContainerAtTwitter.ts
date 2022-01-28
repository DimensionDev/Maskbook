import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
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

const MAIN_SCRIPT_SELECTOR = 'script[src*="client-web/main"]'
const NFT_SCRIPT_SELECTOR = 'script[src*="client-web/bundle.UserNft"]'

function useScriptContent(selector: string) {
    return useAsyncRetry(async () => {
        if (!selector) return
        const script = document.querySelector(selector)
        const url = script?.getAttribute('src')
        if (!url) return
        const respnose = await fetch(url, {
            method: 'GET',
        })
        return respnose.text()
    }, [selector])
}

function useBearerToken() {
    const { value: content } = useScriptContent(MAIN_SCRIPT_SELECTOR)
    return useMemo(() => {
        if (!content) return
        const [, token] = content.match(/s="(\w+%3D\w+)"/) ?? []
        return token
    }, [content])
}

function useQueryToken() {
    const { value: content } = useScriptContent(NFT_SCRIPT_SELECTOR)
    return useMemo(() => {
        if (!content) return
        const [, token] = content.match(/{\s?id:\s?"([\w-]+)"/) ?? []
        return token
    }, [content])
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
    const bearerToken = useBearerToken()
    const queryToken = useQueryToken()
    const csrfToken = useCSRFToken()

    return useAsyncRetry(async () => {
        if (!bearerToken || !queryToken || !csrfToken) return
        const response = await fetch(
            urlcat('https://twitter.com/i/api/graphql/:queryToken/userNftContainer_Query?variables=:queries', {
                queryToken,
                queries: encodeURIComponent(
                    JSON.stringify({
                        screenName,
                    }),
                ),
            }),
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
