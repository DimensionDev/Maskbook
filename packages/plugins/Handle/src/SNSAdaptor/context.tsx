import { createContext, useMemo, type PropsWithChildren } from 'react'
import type { SearchResultType, EOAResult } from '@masknet/web3-shared-base'
import { type BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import { useSocialAccountListByAddress } from '@masknet/web3-hooks-base'
import { resolveNonFungibleTokenIdFromEnsDomain, type ChainId } from '@masknet/web3-shared-evm'

interface ENSContextProps {
    nextIdBindings: BindingProof[]
    reversedAddress: string | undefined
    domain: string | undefined
    tokenId: string | undefined
}

export const ENSContext = createContext<ENSContextProps>({
    nextIdBindings: [],
    reversedAddress: undefined,
    tokenId: undefined,
    domain: '',
})
ENSContext.displayName = 'ENSContext'

export function ENSProvider({ children, result }: PropsWithChildren<SearchResultInspectorProps>) {
    const { domain, address, bindingProofs } = result

    const tokenId = domain ? resolveNonFungibleTokenIdFromEnsDomain(domain) : ''

    const { value: nextIdBindings = EMPTY_LIST } = useSocialAccountListByAddress(address, bindingProofs)

    const context = useMemo(
        () => ({
            reversedAddress: address,
            tokenId,
            domain,
            nextIdBindings,
        }),
        [address, tokenId, domain, JSON.stringify(nextIdBindings)],
    )

    return <ENSContext.Provider value={context}>{children}</ENSContext.Provider>
}

export interface SearchResultInspectorProps {
    result: EOAResult<ChainId>
    keyword: string
    keywordType?: SearchResultType
}
