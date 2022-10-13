import { createContext, PropsWithChildren, FC } from 'react'
import { useAsync } from 'react-use'
import { useLookupAddress, PluginWeb3ContextProvider, PluginIDContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID, NextIDPlatform, BindingProof } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { ChainId, resolveNonFungibleTokenIdFromEnsDomain } from '@masknet/web3-shared-evm'
import { uniqBy } from 'lodash-unified'

interface ENSContextProps {
    isLoading: boolean

    firstValidNextIdTwitterBinding: BindingProof | undefined
    restOfValidNextIdTwitterBindings: BindingProof[]
    validNextIdTwitterBindings: BindingProof[]
    reversedAddress: string | undefined
    domain: string
    isError: boolean
    tokenId: string | undefined
    retry: (() => void) | undefined
}

export const ENSContext = createContext<ENSContextProps>({
    isLoading: true,

    firstValidNextIdTwitterBinding: undefined,
    restOfValidNextIdTwitterBindings: [],
    validNextIdTwitterBindings: [],
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
    } = useLookupAddress(domain, NetworkPluginID.PLUGIN_EVM, ChainId.Mainnet)
    const isError = !!error
    const tokenId = resolveNonFungibleTokenIdFromEnsDomain(domain)
    const { value: ids } = useAsync(
        async () =>
            reversedAddress
                ? NextIDProof.queryExistedBindingByPlatform(NextIDPlatform.Ethereum, reversedAddress ?? '')
                : [],
        [reversedAddress, domain],
    )

    const validNextIdTwitterBindings = uniqBy(
        (ids ?? []).reduce<BindingProof[]>((acc, cur) => {
            return acc.concat(cur.proofs.filter((proof) => proof.is_valid && proof.platform === NextIDPlatform.Twitter))
        }, []),
        (x) => x.identity,
    ).sort((a, b) => Number(b.last_checked_at) - Number(a.last_checked_at))

    const firstValidNextIdTwitterBinding = validNextIdTwitterBindings[0]
    const restOfValidNextIdTwitterBindings = validNextIdTwitterBindings.slice(1)

    return (
        <ENSContext.Provider
            value={{
                isLoading,
                reversedAddress,
                isError,
                retry,
                tokenId,
                domain,
                validNextIdTwitterBindings,
                firstValidNextIdTwitterBinding,
                restOfValidNextIdTwitterBindings,
            }}>
            {children}
        </ENSContext.Provider>
    )
}

export const RootContext: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
            <PluginWeb3ContextProvider pluginID={NetworkPluginID.PLUGIN_EVM} value={{ chainId: ChainId.Mainnet }}>
                {children}
            </PluginWeb3ContextProvider>
        </PluginIDContextProvider>
    )
}

export interface SearchResultInspectorProps {
    domain: string
}
