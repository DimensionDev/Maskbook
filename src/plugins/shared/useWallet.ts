import { useState, useEffect, useCallback } from 'react'
import { EthereumTokenType } from '../Wallet/database/types'
import Services from '../../extension/service'
import { PluginMessageCenter } from '../PluginMessages'
import { formatBalance } from '../Wallet/formatter'
import { ETH_ADDRESS } from '../Wallet/token'
import { currentEthereumNetworkSettings } from '../Wallet/UI/Developer/EthereumNetworkSettings'
import useSWR from 'swr'
import type { WalletDetails, ERC20TokenDetails } from '../../extension/background-script/PluginService'

const getWallets = () => Services.Plugin.getWallets()
const getManagedWallets = Services.Plugin.getManagedWalletDetail
export function useWallet() {
    const swr = useSWR('query', {
        fetcher: getWallets,
    })
    const { revalidate, data } = swr
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    useEffect(() => currentEthereumNetworkSettings.addListener(revalidate), [revalidate])
    return {
        ...swr,
        wallets: data?.wallets,
        tokens: data?.tokens,
        requestConnectWallet: useCallback(() => {
            Services.Welcome.openOptionsPage('/wallets/error?reason=nowallet')
        }, []),
    }
}
export function useManagedWalletDetail(address: string | undefined) {
    const swr = useSWR(address ?? null, { fetcher: getManagedWallets })
    const { revalidate } = swr
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    return swr
}
export type SelectedTokenType =
    | {
          type: 'eth'
      }
    | {
          type: 'erc20'
          address: string
      }
export function useSelectWallet(
    wallets: WalletDetails[] | undefined,
    tokens: ERC20TokenDetails[] | undefined,
    requestConnectWallet: () => void,
) {
    const [selectedWalletAddress, setSelectedWalletAddress] = useState<undefined | string>(undefined)

    const [selectedTokenAddress, setSelectedTokenAddress] = useState(ETH_ADDRESS)
    const [selectedTokenType, setSelectedTokenType] = useState<EthereumTokenType>(EthereumTokenType.ETH)
    const selectedWallet = wallets?.find((x) => x.address === selectedWalletAddress)

    const availableTokens = Array.from(Object.entries(selectedWallet?.erc20tokens || {}) || [])
        .filter(([address]) => tokens?.find((x) => x.address === address))
        .map(([address, amount]) => ({ amount, ...tokens?.find((x) => x.address === address)! }))
    const selectedToken =
        selectedTokenType === EthereumTokenType.ETH
            ? undefined
            : availableTokens.find((x) => x.address === selectedTokenAddress)!

    useEffect(() => {
        if (selectedWalletAddress === undefined) {
            if (!wallets) return
            if (wallets?.length === 0) requestConnectWallet()
            else setSelectedWalletAddress(wallets[0].address)
        }
    }, [requestConnectWallet, selectedWalletAddress, wallets])

    const ethBalance = selectedWallet
        ? `${formatBalance(selectedWallet.ethBalance, 18) ?? '(Syncing...)'} ETH`
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
