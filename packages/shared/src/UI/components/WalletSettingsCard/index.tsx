import { memo, useMemo } from 'react'
import type { BindingProof } from '@masknet/shared-base'
import { isSameAddress, resolveNextID_NetworkPluginID } from '@masknet/web3-shared-base'
import {
    useDefaultChainId,
    useNetworkDescriptor,
    useReverseAddress,
    useWallets,
    useWeb3Utils,
} from '@masknet/web3-hooks-base'
import { WalletSettingsCardUI } from './WalletSettingsCardUI.js'

interface WalletSettingsCardProps {
    wallet: BindingProof
    fallbackName?: string
    checked: boolean
    onSwitchChange: (address: string) => void
}

export const WalletSettingsCard = memo<WalletSettingsCardProps>(function WalletSettingsCard({
    wallet,
    fallbackName,
    checked,
    onSwitchChange,
}) {
    const wallets = useWallets()
    const networkPluginId = resolveNextID_NetworkPluginID(wallet.platform)
    const chainId = useDefaultChainId(networkPluginId)
    const networkDescriptor = useNetworkDescriptor(networkPluginId, chainId)
    const Utils = useWeb3Utils(networkPluginId)
    const { data: domain } = useReverseAddress(networkPluginId, wallet.identity)

    const walletName = useMemo(() => {
        if (domain) return domain
        const walletAtDB = wallets.find((x) => isSameAddress(wallet.identity, x.address))
        if (walletAtDB) return walletAtDB.name
        return
    }, [domain, wallets, wallet.identity])

    const formattedAddress = Utils.formatAddress(wallet.identity, 4)
    const addressLink = Utils.explorerResolver.addressLink(chainId, wallet.identity)
    return (
        <WalletSettingsCardUI
            onSwitchChange={() => onSwitchChange(wallet.identity)}
            icon={networkDescriptor?.icon}
            formattedAddress={formattedAddress}
            addressLink={addressLink}
            walletName={walletName ?? fallbackName}
            checked={checked}
        />
    )
})
