import { useCallback, cloneElement, isValidElement } from 'react'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { useSolletWallet } from '../../hooks/useSollectWallet'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base/lib/index.js'
import { getStorage } from '../../storage'

export function ProviderIconClickBait({
    network,
    provider,
    children,
    onSubmit,
    onClick,
}: Web3Plugin.UI.ProviderIconClickBaitProps) {
    const solletWallet = useSolletWallet(WalletAdapterNetwork.Mainnet)
    const onLogIn = useCallback(async () => {
        onClick?.(network, provider)
        const adapter = solletWallet.adapter()
        await adapter.connect()
        if (adapter?.publicKey) {
            await getStorage().publicKey.setValue(adapter.publicKey)
            onSubmit?.(network, provider)
        }
    }, [solletWallet, provider, onClick, onSubmit])

    return (
        <>
            {isValidElement<object>(children)
                ? cloneElement(children, {
                      ...children.props,
                      ...{
                          onClick: onLogIn,
                      },
                  })
                : children}
        </>
    )
}
