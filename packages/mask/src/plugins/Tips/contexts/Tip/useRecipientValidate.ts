import { useAddressType } from '@masknet/plugin-infra/web3'
import { AddressType } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'
import { useI18N } from '../../locales'
import type { ValidationTuple } from '../../types'
import { TargetRuntimeContext } from '../TargetRuntimeContext.js'

export function useRecipientValidate(recipientAddress: string): { loading: boolean; validation: ValidationTuple } {
    const { pluginId, targetChainId: chainId } = TargetRuntimeContext.useContainer()
    const { value: addressType, loading } = useAddressType(pluginId, recipientAddress, {
        chainId,
    })
    const t = useI18N()
    const validation: ValidationTuple = useMemo(() => {
        if (addressType === AddressType.Contract) return [false, t.recipient_address_is_contract()]
        return [true]
    }, [addressType, t])
    return {
        loading,
        validation,
    }
}
