import { useCallback, cloneElement, isValidElement } from 'react'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { SolletWalletAdapter } from '@solana/wallet-adapter-wallets'

import { getStorage } from '../../storage'

export function ProviderIconClickBait({
    network,
    provider,
    children,
    onSubmit,
    onClick,
}: Web3Plugin.UI.ProviderIconClickBaitProps) {
    const solletAdapter = new SolletWalletAdapter({ network: WalletAdapterNetwork.Mainnet })
    const onLogIn = useCallback(async () => {
        onClick?.(network, provider)
        await solletAdapter.connect()
        if (solletAdapter?.publicKey) {
            await getStorage().publicKey.setValue(solletAdapter.publicKey.toBase58())
            onSubmit?.(network, provider)
        }
    }, [provider, onClick, onSubmit])

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
