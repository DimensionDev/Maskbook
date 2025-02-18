import { createContext, useMemo, type PropsWithChildren } from 'react'
import type { SearchResultType, EOAResult } from '@masknet/web3-shared-base'
import { EMPTY_LIST, type Web3BioProfile } from '@masknet/shared-base'
import { resolveNonFungibleTokenIdFromEnsDomain, type ChainId } from '@masknet/web3-shared-evm'
import { useSocialAccountListByAddressOrDomain } from '@masknet/web3-hooks-base'

interface ENSContextProps {
    web3bioProfiles: Web3BioProfile[]
    reversedAddress: string | undefined
    domain: string | undefined
    tokenId: string | undefined
}

export const ENSContext = createContext<ENSContextProps>({
    web3bioProfiles: [],
    reversedAddress: undefined,
    tokenId: undefined,
    domain: '',
})
ENSContext.displayName = 'ENSContext'

export function ENSProvider({ children, result }: PropsWithChildren<SearchResultInspectorProps>) {
    const { domain, address, web3bioProfiles: profiles } = result

    const tokenId = domain ? resolveNonFungibleTokenIdFromEnsDomain(domain) : ''

    const { data: web3bioProfiles = EMPTY_LIST } = useSocialAccountListByAddressOrDomain(address, domain, profiles)

    const context = useMemo(
        () => ({
            reversedAddress: address,
            tokenId,
            domain,
            web3bioProfiles,
        }),
        [address, tokenId, domain, web3bioProfiles],
    )

    return <ENSContext value={context}>{children}</ENSContext>
}

export interface SearchResultInspectorProps {
    result: EOAResult<ChainId>
    keyword: string
    keywordType?: SearchResultType
}
