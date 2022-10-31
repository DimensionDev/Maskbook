import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { useAddressType, useChainContext } from '@masknet/web3-hooks-base'
import { GoPlusLabs } from '@masknet/web3-providers'
import { AddressType } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { useI18N } from '../../locales/index.js'
import type { ValidationTuple } from '../../types/index.js'

export function useRecipientValidate(recipientAddress: string): {
    loading: boolean
    validation: ValidationTuple
} {
    const t = useI18N()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: addressType, loading } = useAddressType(NetworkPluginID.PLUGIN_EVM, recipientAddress, {
        chainId,
    })
    const { value: security } = useAsync(async () => {
        return GoPlusLabs.getAddressSecurity(chainId, recipientAddress)
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
