import React, { useState, useEffect, useCallback } from 'react'
import { WalletRecord, ERC20TokenRecord, EthereumTokenType } from '../Wallet/database/types'
import Services from '../../extension/service'
import { PluginMessageCenter } from '../PluginMessages'
import { formatBalance } from '../Wallet/formatter'
import { ETH_ADDRESS } from '../Wallet/erc20'
import { currentEthereumNetworkSettings } from '../Wallet/UI/Developer/EthereumNetworkSettings'

export function useWalletDataSource() {
    const [wallets, setWallets] = useState<WalletRecord[] | 'loading'>('loading')
    const [tokens, setTokens] = useState<ERC20TokenRecord[]>([])

    useEffect(() => {
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
        useCallback(() => {
            Services.Welcome.openOptionsPage('/wallets/error?reason=nowallet')
        }, []),
    ] as const
}
export type SelectedTokenType =
    | {
          type: 'eth'
      }
    | {
          type: 'erc20'
          address: string
      }
export function useSelectWallet(...[wallets, tokens, onRequireNewWallet]: ReturnType<typeof useWalletDataSource>) {
    const [selectedWalletAddress, setSelectedWalletAddress] = useState<undefined | string>(undefined)

    const [selectedTokenAddress, setSelectedTokenAddress] = useState(ETH_ADDRESS)
    const [selectedTokenType, setSelectedTokenType] = useState<EthereumTokenType>(EthereumTokenType.ETH)
    const selectedWallet = wallets === 'loading' ? undefined : wallets.find((x) => x.address === selectedWalletAddress)

    const availableTokens = Array.from(selectedWallet?.erc20_token_balance || [])
        .filter(([address]) => tokens.find((x) => x.address === address))
        .map(([address, amount]) => ({ amount, ...tokens.find((x) => x.address === address)! }))
    const selectedToken =
        selectedTokenType === EthereumTokenType.ETH
            ? undefined
            : availableTokens.find((x) => x.address === selectedTokenAddress)!

    useEffect(() => {
        if (selectedWalletAddress === undefined) {
            if (wallets === 'loading') return
            if (wallets.length === 0) onRequireNewWallet()
            else setSelectedWalletAddress(wallets[0].address)
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
        setSelectedWalletAddress,
        //
        selectedToken,
        selectedTokenType,
        setSelectedTokenType,
        selectedTokenAddress,
        setSelectedTokenAddress,
        availableTokens,
    }
}
