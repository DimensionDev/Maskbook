import { createContext, PropsWithChildren } from 'react'
import { useLookupAddress } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, resolveNonFungibleTokenIdFromEnsDomain } from '@masknet/web3-shared-base'

interface ENSContextProps {
    isLoading: boolean
    isNoResult: boolean
    reversedAddress: string | undefined
    isError: boolean
    tokenId: string | undefined
    retry: (() => void) | undefined
}

export const ENSContext = createContext<ENSContextProps>({
    isLoading: true,
    isNoResult: true,
    reversedAddress: undefined,
    tokenId: undefined,
    isError: false,
    retry: undefined,
})

export function ENSProvider({ children, domain }: PropsWithChildren<SearchResultInspectorProps>) {
    const {
        value: reversedAddress,
        loading: isLoading,
        error,
        retry,
    } = useLookupAddress(NetworkPluginID.PLUGIN_EVM, domain)
    const isNoResult = reversedAddress === undefined
    const isError = !!error
    const tokenId = resolveNonFungibleTokenIdFromEnsDomain(domain)
    console.log({ reversedAddress, tokenId })
    return (
        <ENSContext.Provider value={{ isLoading, reversedAddress, isNoResult, isError, retry, tokenId }}>
            {children}
        </ENSContext.Provider>
    )
}

export interface SearchResultInspectorProps {
    domain: string
}
