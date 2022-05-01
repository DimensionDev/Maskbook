import { memo } from 'react'
import { Icon } from '@masknet/icons'
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
                icon={<Icon type="metaMask" />}
                onClick={() => onConnect(ConnectWalletTargets.MetaMask)}
            />
            <ConnectActionListItem
                title={t.wallets_connect_wallet_connect()}
                icon={<Icon type="walletConnect" />}
                onClick={() => onConnect(ConnectWalletTargets.Connect)}
            />
            <ConnectActionListItem
                title={t.wallets_connect_wallet_polka()}
                icon={<Icon type="polkaDot" />}
                onClick={() => onConnect(ConnectWalletTargets.PolkaDot)}
            />
        </ConnectActionList>
    )
})
