import { createContext, PropsWithChildren } from 'react'
import { useAsync } from 'react-use'
import { uniqBy } from 'lodash-unified'
import { NextIDProof } from '@masknet/web3-providers'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import { BindingProof, NetworkPluginID, NextIDPlatform } from '@masknet/shared-base'
import { resolveNonFungibleTokenIdFromEnsDomain } from '@masknet/web3-shared-evm'

interface ENSContextProps {
    isLoading: boolean
    firstValidNextIdTwitterBinding: BindingProof | undefined
    restOfValidNextIdTwitterBindings: BindingProof[]
    validNextIdTwitterBindings: BindingProof[]
    reversedAddress: string | undefined
    keyword: string
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
    keyword: '',
    isError: false,
    retry: undefined,
})
ENSContext.displayName = 'ENSContext'

export function ENSProvider({ children, keyword }: PropsWithChildren<SearchResultInspectorProps>) {
    const {
        value: reversedAddress,
        loading: isLoading,
        error,
        retry,
    } = useLookupAddress(NetworkPluginID.PLUGIN_EVM, keyword)
    const isError = !!error
    const tokenId = resolveNonFungibleTokenIdFromEnsDomain(keyword)
    const { value: ids } = useAsync(
        async () =>
            reversedAddress
                ? NextIDProof.queryExistedBindingByPlatform(NextIDPlatform.Ethereum, reversedAddress ?? '')
                : [],
        [reversedAddress, keyword],
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
                keyword,
                validNextIdTwitterBindings,
                firstValidNextIdTwitterBinding,
                restOfValidNextIdTwitterBindings,
            }}>
            {children}
        </ENSContext.Provider>
    )
}

export interface SearchResultInspectorProps {
    keyword: string
}
