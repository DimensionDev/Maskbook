import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { NetworkPluginID } from '@masknet/shared-base'
import { useAddressType, useChainContext } from '@masknet/web3-hooks-base'
import { GoPlusLabs } from '@masknet/web3-providers'
import { AddressType, type ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { ValidationTuple } from '../../types/index.js'
import { TargetRuntimeContext } from '../TargetRuntimeContext.js'

export function useRecipientValidate(recipientAddress: string): {
    loading: boolean
    validation: ValidationTuple
} {
    const { _ } = useLingui()
    const { targetPluginID } = TargetRuntimeContext.useContainer()
    const { chainId } = useChainContext()
    const { value: addressType, loading } = useAddressType(targetPluginID, recipientAddress, {
        chainId,
    })
    const isEvm = targetPluginID === NetworkPluginID.PLUGIN_EVM
    const { data: security } = useQuery({
        enabled: isEvm,
        queryKey: ['go-plus', 'address-security', chainId, recipientAddress],
        queryFn: () => GoPlusLabs.getAddressSecurity(chainId as ChainId, recipientAddress),
    })

    const validation: ValidationTuple = useMemo(() => {
        if (!isEvm) return [true]
        if (addressType === AddressType.Contract)
            return [false, _(msg`The receiving address is a contract address. Please check again.`)]
        const isMaliciousAddress = security && Object.values(security).filter((x) => x === '1').length > 0
        if (isMaliciousAddress) return [false, _(msg`The receiving address may be a malicious address.`)]
        return [true]
    }, [isEvm, addressType, security, _])
    return {
        loading,
        validation,
    }
}
