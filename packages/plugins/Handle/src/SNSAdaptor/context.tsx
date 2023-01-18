import { createContext, PropsWithChildren } from 'react'
import { useAsync } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import type { SearchResultType, DomainResult } from '@masknet/web3-shared-base'
import { BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import { resolveNonFungibleTokenIdFromEnsDomain, ChainId } from '@masknet/web3-shared-evm'

interface ENSContextProps {
    firstNextIdBinding: BindingProof | undefined
    restOfNextIdBindings: BindingProof[]
    nextIdBindings: BindingProof[]
    reversedAddress: string | undefined
    domain: string
    tokenId: string | undefined
}

export const ENSContext = createContext<ENSContextProps>({
    firstNextIdBinding: undefined,
    restOfNextIdBindings: [],
    nextIdBindings: [],
    reversedAddress: undefined,
    tokenId: undefined,
    domain: '',
})
ENSContext.displayName = 'ENSContext'

export function ENSProvider({ children, result }: PropsWithChildren<SearchResultInspectorProps>) {
    const domain = result.domain
    const reversedAddress = result.address
    const tokenId = resolveNonFungibleTokenIdFromEnsDomain(domain)

    const { value: nextIdBindings = EMPTY_LIST } = useAsync(
        async () => (reversedAddress ? NextIDProof.queryProfilesByRelationService(reversedAddress) : EMPTY_LIST),
        [reversedAddress],
    )

    const firstNextIdBinding = nextIdBindings[0]
    const restOfNextIdBindings = nextIdBindings.slice(1)

    return (
        <ENSContext.Provider
            value={{
                reversedAddress,
                tokenId,
                domain,
                nextIdBindings,
                firstNextIdBinding,
                restOfNextIdBindings,
            }}>
            {children}
        </ENSContext.Provider>
    )
}

export interface SearchResultInspectorProps {
    result: DomainResult<ChainId>
    keyword: string
    keywordType?: SearchResultType
}
