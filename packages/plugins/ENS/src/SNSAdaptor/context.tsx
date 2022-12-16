import { createContext, PropsWithChildren } from 'react'
import { useAsync } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import type { SearchResultType, DomainResult } from '@masknet/web3-shared-base'
import type { BindingProof } from '@masknet/shared-base'
import { resolveNonFungibleTokenIdFromEnsDomain, ChainId } from '@masknet/web3-shared-evm'

interface ENSContextProps {
    firstNextIdrBinding: BindingProof | undefined
    restOfNextIdBindings: BindingProof[]
    nextIdBindings: BindingProof[]
    reversedAddress: string | undefined
    domain: string
    tokenId: string | undefined
}

export const ENSContext = createContext<ENSContextProps>({
    firstNextIdrBinding: undefined,
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

    const { value: nextIdBindings = [] } = useAsync(
        async () => (reversedAddress ? NextIDProof.queryProfilesByRelationService(reversedAddress) : []),
        [reversedAddress],
    )

    const firstNextIdrBinding = nextIdBindings[0]
    const restOfNextIdBindings = nextIdBindings.slice(1)

    return (
        <ENSContext.Provider
            value={{
                reversedAddress,
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
    result: DomainResult<ChainId>
    keyword: string
    keywordType?: SearchResultType
}
