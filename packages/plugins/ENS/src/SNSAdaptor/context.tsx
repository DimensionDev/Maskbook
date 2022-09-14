import { createContext, PropsWithChildren } from 'react'
import { useAsync } from 'react-use'
import { useLookupAddress } from '@masknet/plugin-infra/web3'
import { NextIDPlatform, BindingProof } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { resolveNonFungibleTokenIdFromEnsDomain } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'

interface ENSContextProps {
    isLoading: boolean
    isNoResult: boolean
    nextIdTwitterBindingName: string | undefined
    reversedAddress: string | undefined
    domain: string
    isError: boolean
    tokenId: string | undefined
    retry: (() => void) | undefined
}

export const ENSContext = createContext<ENSContextProps>({
    isLoading: true,
    isNoResult: true,
    nextIdTwitterBindingName: undefined,
    reversedAddress: undefined,
    tokenId: undefined,
    domain: '',
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

    const { value: ids } = useAsync(
        async () => NextIDProof.queryExistedBindingByPlatform(NextIDPlatform.Twitter, domain),
        [domain],
    )

    const validNextIdTwitterBinding = ids?.reduce<BindingProof | undefined>((acc, cur) => {
        const p = cur.proofs.find((proof) => proof.is_valid && proof.platform === NextIDPlatform.Twitter)
        return p ?? acc
    }, undefined)

    return (
        <ENSContext.Provider
            value={{
                isLoading,
                reversedAddress,
                isNoResult,
                isError,
                retry,
                tokenId,
                domain,
                nextIdTwitterBindingName: validNextIdTwitterBinding?.identity,
            }}>
            {children}
        </ENSContext.Provider>
    )
}

export interface SearchResultInspectorProps {
    domain: string
}
