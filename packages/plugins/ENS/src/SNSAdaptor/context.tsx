import { createContext, PropsWithChildren, useCallback, useMemo } from 'react'
import { useAsync } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import { useWeb3State, useLookupAddress, useReverseAddress } from '@masknet/web3-hooks-base'
import { SearchKeywordType, resolveSearchKeywordType } from '@masknet/web3-shared-base'
import { BindingProof, NetworkPluginID } from '@masknet/shared-base'
import { resolveNonFungibleTokenIdFromEnsDomain, ChainId } from '@masknet/web3-shared-evm'

interface ENSContextProps {
    isLoading: boolean
    firstNextIdrBinding: BindingProof | undefined
    restOfNextIdBindings: BindingProof[]
    nextIdBindings: BindingProof[]
    reversedAddress: string | undefined
    domain: string
    isError: boolean
    tokenId: string | undefined
    retry: (() => void) | undefined
}

export const ENSContext = createContext<ENSContextProps>({
    isLoading: true,
    firstNextIdrBinding: undefined,
    restOfNextIdBindings: [],
    nextIdBindings: [],
    reversedAddress: undefined,
    tokenId: undefined,
    domain: '',
    isError: false,
    retry: undefined,
})
ENSContext.displayName = 'ENSContext'

export function ENSProvider({ children, keyword }: PropsWithChildren<SearchResultInspectorProps>) {
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const keywordType = resolveSearchKeywordType(
        keyword,
        (keyword: string) => Boolean(Others?.isValidDomain(keyword)),
        (keyword: string) => Boolean(Others?.isValidAddress(keyword) && !Others?.isZeroAddress(keyword)),
    )
    const {
        value: _reversedAddress,
        loading: isLoadingLookup,
        error: lookupError,
        retry: retryLookup,
    } = useLookupAddress(NetworkPluginID.PLUGIN_EVM, keyword, ChainId.Mainnet)
    const {
        value: _domain,
        loading: isLoadingReverse,
        error: reverseError,
        retry: retryReverse,
    } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, keyword, ChainId.Mainnet)

    const isLoading =
        (isLoadingLookup && keywordType === SearchKeywordType.Domain) ||
        (isLoadingReverse && keywordType === SearchKeywordType.Address)
    const isError =
        (!!lookupError && keywordType === SearchKeywordType.Domain) ||
        (!!reverseError && keywordType === SearchKeywordType.Address)
    const retry = useCallback(() => {
        if (keywordType === SearchKeywordType.Domain) retryLookup()
        if (keywordType === SearchKeywordType.Address) retryReverse()
    }, [keywordType, keyword])

    const reversedAddress = useMemo(() => {
        if (keywordType === SearchKeywordType.Domain) return _reversedAddress
        if (keywordType === SearchKeywordType.Address) return keyword
        return undefined
    }, [keywordType, keyword, _reversedAddress])

    const domain = useMemo(() => {
        if (keywordType === SearchKeywordType.Domain) return keyword
        if (keywordType === SearchKeywordType.Address) return _domain ?? ''
        return ''
    }, [keywordType, keyword, _domain])

    const tokenId = resolveNonFungibleTokenIdFromEnsDomain(domain)

    const { value: nextIdBindings = [] } = useAsync(
        async () => (reversedAddress ? NextIDProof.queryProfilesByRelationService(reversedAddress) : []),
        [reversedAddress, keyword],
    )

    const firstNextIdrBinding = nextIdBindings[0]
    const restOfNextIdBindings = nextIdBindings.slice(1)

    return (
        <ENSContext.Provider
            value={{
                isLoading,
                reversedAddress,
                isError,
                retry,
                tokenId,
                domain,
                nextIdBindings,
                firstNextIdrBinding,
                restOfNextIdBindings,
            }}>
            {children}
        </ENSContext.Provider>
    )
}

export interface SearchResultInspectorProps {
    keyword: string
    keywordType?: SearchKeywordType
}
