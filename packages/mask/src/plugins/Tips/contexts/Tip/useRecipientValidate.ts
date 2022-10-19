import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { useAddressType, useChainId, useCurrentWeb3NetworkPluginID } from '@masknet/web3-hooks-base'
import { GoPlusLabs } from '@masknet/web3-providers'
import { AddressType, ChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../locales'
import type { ValidationTuple } from '../../types'

export function useRecipientValidate(recipientAddress: string): { loading: boolean; validation: ValidationTuple } {
    const t = useI18N()
    const chainId = useChainId()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const { value: addressType, loading } = useAddressType(pluginID, recipientAddress, {
        chainId,
    })
    const { value: security } = useAsync(async () => {
        return GoPlusLabs.getAddressSecurity(chainId as ChainId, recipientAddress)
    }, [chainId, recipientAddress])

    const isMaliciousAddress = security && Object.values(security).filter((x) => x === '1').length > 0

    const validation: ValidationTuple = useMemo(() => {
        if (addressType === AddressType.Contract) return [false, t.recipient_address_is_contract()]
        if (isMaliciousAddress) return [false, t.recipient_address_is_malicious()]
        return [true]
    }, [addressType, isMaliciousAddress, t])
    return {
        loading,
        validation,
    }
}
