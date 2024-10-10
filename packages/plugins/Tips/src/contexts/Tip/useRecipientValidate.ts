import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { useAddressType, useChainContext } from '@masknet/web3-hooks-base'
import { GoPlusLabs } from '@masknet/web3-providers'
import { AddressType } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ValidationTuple } from '../../types/index.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export function useRecipientValidate(recipientAddress: string): {
    loading: boolean
    validation: ValidationTuple
} {
    const { _ } = useLingui()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: addressType, loading } = useAddressType(NetworkPluginID.PLUGIN_EVM, recipientAddress, {
        chainId,
    })
    const { value: security } = useAsync(async () => {
        return GoPlusLabs.getAddressSecurity(chainId, recipientAddress)
    }, [chainId, recipientAddress])

    const isMaliciousAddress = security && Object.values(security).filter((x) => x === '1').length > 0

    const validation: ValidationTuple = useMemo(() => {
        if (addressType === AddressType.Contract)
            return [false, _(msg`The receiving address is a contract address. Please check again.`)]
        if (isMaliciousAddress) return [false, _(msg`The receiving address may be a malicious address.`)]
        return [true]
    }, [addressType, isMaliciousAddress, _])
    return {
        loading,
        validation,
    }
}
