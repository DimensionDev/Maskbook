import React from 'react'
import type { WalletRecord, ERC20TokenRecord } from '../Wallet/database/types'
import Services from '../../extension/service'
import { PluginMessageCenter } from '../PluginMessages'
import { currentEthereumNetworkSettings } from '../Wallet/UI/Developer/SelectEthereumNetwork'
import { formatBalance } from '../Wallet/formatter'

export function useWalletDataSource() {
    const [wallets, setWallets] = React.useState<WalletRecord[] | 'loading'>('loading')
    const [tokens, setTokens] = React.useState<ERC20TokenRecord[]>([])

    React.useEffect(() => {
        const update = () =>
            Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets').then(([x, y]) => {
                setWallets(x)
                setTokens(y)
            })
        update()
        currentEthereumNetworkSettings.addListener(update)
        return PluginMessageCenter.on('maskbook.wallets.update', update)
    }, [])
    return [
        wallets,
        tokens,
        React.useCallback(() => {
            Services.Welcome.openOptionsPage('/wallets/error?reason=nowallet')
        }, []),
    ] as const
}

export function useSelectWallet(...[wallets, tokens, onRequireNewWallet]: ReturnType<typeof useWalletDataSource>) {
    const [selectedWalletAddress, setSelectedWallet] = React.useState<undefined | string>(undefined)
    const [selectedTokenType, setSelectedTokenType] = React.useState<
        { type: 'eth' } | { type: 'erc20'; address: string }
    >({
        type: 'eth',
    })
    const selectedWallet = wallets === 'loading' ? undefined : wallets.find((x) => x.address === selectedWalletAddress)

    const availableTokens = Array.from(selectedWallet?.erc20_token_balance || [])
        .filter(([address]) => tokens.find((x) => x.address === address))
        .map(([address, amount]) => ({ amount, ...tokens.find((x) => x.address === address)! }))
    const selectedToken =
        selectedTokenType.type === 'eth'
            ? undefined
            : availableTokens.find((x) => x.address === selectedTokenType.address)!

    React.useEffect(() => {
        if (selectedWalletAddress === undefined) {
            if (wallets === 'loading') return
            if (wallets.length === 0) onRequireNewWallet()
            else setSelectedWallet(wallets[0].address)
        }
    }, [onRequireNewWallet, selectedWalletAddress, wallets])

    const ethBalance = selectedWallet
        ? `${formatBalance(selectedWallet.eth_balance, 18) ?? '(Syncing...)'} ETH`
        : undefined
    const erc20Balance = selectedToken
        ? `${formatBalance(selectedToken.amount, selectedToken.decimals) ?? '(Syncing...)'} ${selectedToken.symbol}`
        : undefined
    return {
        ethBalance,
        erc20Balance,
        //
        selectedWallet,
        selectedWalletAddress,
        setSelectedWallet,
        //
        selectedToken,
        selectedTokenType,
        setSelectedTokenType,
        availableTokens,
    }
}
