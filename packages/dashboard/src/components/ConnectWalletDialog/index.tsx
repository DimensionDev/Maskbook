import { memo } from 'react'
import { ConnectActionList, ConnectActionListItem } from '../ConnectActionList'
import { PolkaDotIcon, WalletConnectIcon, MetaMaskIcon } from '@dimensiondev/icons'

export enum ConnectWalletTargets {
    MetaMask,
    Connect,
    PolkaDot,
}
export interface ConnectWalletListProps {
    onConnect(target: ConnectWalletTargets): void
}
export const ConnectWalletList = memo(({ onConnect }: ConnectWalletListProps) => {
    return (
        <ConnectActionList>
            <ConnectActionListItem
                title="MetaMask"
                icon={<MetaMaskIcon fontSize="inherit" />}
                onClick={() => onConnect(ConnectWalletTargets.MetaMask)}
            />
            <ConnectActionListItem
                title="Connect Wallet"
                icon={<WalletConnectIcon fontSize="inherit" />}
                onClick={() => onConnect(ConnectWalletTargets.Connect)}
            />
            <ConnectActionListItem
                title="PolkaDot Wallet"
                icon={<PolkaDotIcon fontSize="inherit" />}
                onClick={() => onConnect(ConnectWalletTargets.PolkaDot)}
            />
        </ConnectActionList>
    )
})
