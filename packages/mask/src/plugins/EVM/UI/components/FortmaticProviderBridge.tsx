import { useEffect } from 'react'
import { bridgedEthereumProvider } from '@masknet/injected-script'
import { useValueRef } from '@masknet/shared'
import { isInjectedProvider } from '@masknet/web3-shared-evm'
import { EVM_Messages } from '../../messages'
import { currentProviderSettings } from '../../../Wallet/settings'
import Services from '../../../../extension/service'

export interface FortmaticProviderBridgeProps {}

export function FortmaticProviderBridge(props: FortmaticProviderBridgeProps) {
    const providerType = useValueRef(currentProviderSettings)

    useEffect(() => {}, [])

    // accountsChanged
    useEffect(() => {}, [providerType])

    // chainChanged
    useEffect(() => {}, [providerType])

    return null
}
