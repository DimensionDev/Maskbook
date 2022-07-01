import { memo } from 'react'
import { PolkaDot as PolkaDotIcon, WalletConnect as WalletConnectIcon, MetaMask as MetaMaskIcon } from '@masknet/icons'
import { ConnectActionList, ConnectActionListItem } from '../ConnectActionList'
import { useDashboardI18N } from '../../locales'

export enum ConnectWalletTargets {
    MetaMask = 0,
    Connect = 1,
    PolkaDot = 2,
}
export interface ConnectWalletListProps {
    onConnect(target: ConnectWalletTargets): void
}
export const ConnectWalletList = memo(({ onConnect }: ConnectWalletListProps) => {
    const t = useDashboardI18N()

    return (
        <ConnectActionList>
            <ConnectActionListItem
                title={t.wallets_connect_wallet_metamask()}
                icon={<MetaMaskIcon />}
                onClick={() => onConnect(ConnectWalletTargets.MetaMask)}
            />
            <ConnectActionListItem
                title={t.wallets_connect_wallet_connect()}
                icon={<WalletConnectIcon />}
                onClick={() => onConnect(ConnectWalletTargets.Connect)}
            />
            <ConnectActionListItem
                title={t.wallets_connect_wallet_polka()}
                icon={<PolkaDotIcon />}
                onClick={() => onConnect(ConnectWalletTargets.PolkaDot)}
            />
        </ConnectActionList>
    )
})
