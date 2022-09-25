import { useAddressType } from '@masknet/plugin-infra/web3'
import { GoPlusLabs } from '@masknet/web3-providers'
import { AddressType } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { useI18N } from '../../locales'
import type { ValidationTuple } from '../../types'
import { TargetRuntimeContext } from '../TargetRuntimeContext.js'

export function useRecipientValidate(recipientAddress: string): { loading: boolean; validation: ValidationTuple } {
    const t = useI18N()
    const { pluginId, targetChainId: chainId } = TargetRuntimeContext.useContainer()
    const { value: addressType, loading } = useAddressType(pluginId, recipientAddress, {
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
