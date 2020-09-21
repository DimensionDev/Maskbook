import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { PluginMessageCenter } from '../../PluginMessages'
import Services from '../../../extension/service'
import { EthereumTokenType } from '../../../web3/types'
import type { WalletRecord } from '../database/types'
import type { ERC20TokenDetails } from '../../../extension/background-script/PluginService'
import { formatBalance } from '../formatter'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useChainId } from '../../../web3/hooks/useChainId'

const defaultWalletFetcher = () => Services.Plugin.invokePlugin('maskbook.wallet', 'getDefaultWallet')
const walletsFetcher = () => Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets')
const tokensFetcher = () => Services.Plugin.invokePlugin('maskbook.wallet', 'getTokens')
const managedWalletFetcher = (address: string) =>
    Services.Plugin.invokePlugin('maskbook.wallet', 'getManagedWallet', address)
const managedWalletsFetcher = () => Services.Plugin.invokePlugin('maskbook.wallet', 'getManagedWallets')

export function useDefaultWallet() {
    const swr = useSWR('com.maskbook.wallet.wallet.default', { fetcher: defaultWalletFetcher })
    const { revalidate } = swr
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    return swr
}

export function useWallets() {
    const swr = useSWR('com.maskbook.wallet.wallets', { fetcher: walletsFetcher })
    const { revalidate } = swr
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    return swr
}
export function useTokens() {
    const swr = useSWR('com.maskbook.wallet.tokens', { fetcher: tokensFetcher })
    const { revalidate } = swr
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    return swr
}
export function useManagedWallet(address: string) {
    const swr = useSWR(address, { fetcher: managedWalletFetcher })
    const { revalidate } = swr
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    return swr
}
export function useManagedWallets() {
    const swr = useSWR('com.maskbook.wallet.wallets.managed', { fetcher: managedWalletsFetcher })
    const { revalidate } = swr
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    return swr
}
export function useSelectWallet(wallets: WalletRecord[] | undefined, tokens: ERC20TokenDetails[] | undefined) {
    const ETH_ADDRESS = useConstant('ETH_ADDRESS')

    const chainId = useChainId()
    const [selectedWalletAddress, setSelectedWalletAddress] = useState<undefined | string>(undefined)

    const [selectedTokenAddress, setSelectedTokenAddress] = useState(ETH_ADDRESS)
    const [selectedTokenType, setSelectedTokenType] = useState<EthereumTokenType>(EthereumTokenType.Ether)
    const selectedWallet = wallets?.find((x) => x.address === selectedWalletAddress)

    const availableTokens = (selectedWallet?.erc20_token_balance
        ? Array.from(selectedWallet.erc20_token_balance.entries())
        : []
    )
        .filter(([address]) => tokens?.find((x) => x.address === address && x.chainId === chainId))
        .map(([address, amount]) => ({ amount, ...tokens?.find((x) => x.address === address)! }))
    const selectedToken =
        selectedTokenType === EthereumTokenType.Ether
            ? undefined
            : availableTokens.find((x) => x.address === selectedTokenAddress)!

    useEffect(() => {
        if (selectedWalletAddress === undefined) {
            if (!wallets) return
            if (wallets.length === 0) Services.Provider.requestConnectWallet()
            else setSelectedWalletAddress(wallets[0].address)
        }
    }, [selectedWalletAddress, wallets])

    const ethBalance = selectedWallet ? `${formatBalance(selectedWallet.eth_balance, 18)} ETH` : undefined
    const erc20Balance = selectedToken
        ? `${formatBalance(selectedToken.amount, selectedToken.decimals)} ${selectedToken.symbol}`
        : undefined

    const provider = selectedWallet?.provider
    return {
        ethBalance,
        erc20Balance,
        //
        provider,
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
