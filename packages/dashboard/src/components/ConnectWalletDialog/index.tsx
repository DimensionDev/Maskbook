import { memo } from 'react'
import { ConnectActionList, ConnectActionListItem } from '../ConnectActionList'
import { PolkaDotIcon, WalletConnectIcon, MetaMaskIcon } from '@dimensiondev/icons'
import { useDashboardI18N } from '../../locales'
export enum ConnectWalletTargets {
    MetaMask,
    Connect,
    PolkaDot,
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
                icon={<MetaMaskIcon fontSize="inherit" />}
                onClick={() => onConnect(ConnectWalletTargets.MetaMask)}
            />
            <ConnectActionListItem
                title={t.wallets_connect_wallet_connect()}
                icon={<WalletConnectIcon fontSize="inherit" />}
                onClick={() => onConnect(ConnectWalletTargets.Connect)}
            />
            <ConnectActionListItem
                title={t.wallets_connect_wallet_polka()}
                icon={<PolkaDotIcon fontSize="inherit" />}
                onClick={() => onConnect(ConnectWalletTargets.PolkaDot)}
            />
        </ConnectActionList>
    )
})
