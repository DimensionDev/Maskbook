import { memo, useMemo } from 'react'
import type { BindingProof } from '@masknet/shared-base'
import { isSameAddress, resolveNextID_NetworkPluginID } from '@masknet/web3-shared-base'
import {
    useDefaultChainId,
    useNetworkDescriptor,
    useReverseAddress,
    useWallets,
    useWeb3Others,
} from '@masknet/web3-hooks-base'
import { WalletSettingCardUI } from './UI.js'

interface WalletSettingCardProps {
    wallet: BindingProof
    fallbackName?: string
    checked: boolean
    onSwitchChange: (address: string) => void
}

export const WalletSettingCard = memo<WalletSettingCardProps>(function WalletSettingCard({
    wallet,
    fallbackName,
    checked,
    onSwitchChange,
}) {
    const wallets = useWallets()
    const networkPluginId = resolveNextID_NetworkPluginID(wallet.platform)
    const chainId = useDefaultChainId(networkPluginId)
    const networkDescriptor = useNetworkDescriptor(networkPluginId, chainId)
    const Others = useWeb3Others(networkPluginId)
    const { data: domain } = useReverseAddress(networkPluginId, wallet.identity)

    const walletName = useMemo(() => {
        if (domain) return domain
        const walletAtDB = wallets.find((x) => isSameAddress(wallet.identity, x.address))
        if (walletAtDB) return walletAtDB.name
        return
    }, [domain, wallets, wallet.identity])

    const formattedAddress = Others.formatAddress(wallet.identity, 4)
    const addressLink = Others.explorerResolver.addressLink(chainId, wallet.identity)
    return (
        <WalletSettingCardUI
            onSwitchChange={() => onSwitchChange(wallet.identity)}
            icon={networkDescriptor?.icon}
            formattedAddress={formattedAddress}
            addressLink={addressLink}
            walletName={walletName ?? fallbackName}
            checked={checked}
        />
    )
})
