import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { PluginMessageCenter } from '../../PluginMessages'
import Services from '../../../extension/service'
import { currentLocalWalletEthereumNetworkSettings } from '../../../settings/settings'
import { ChainId, EthereumTokenType } from '../../../web3/types'
import type { WalletRecord } from '../database/types'
import type { ERC20TokenDetails } from '../../../extension/background-script/PluginService'
import { ETH_ADDRESS } from '../token'
import { formatBalance } from '../formatter'

export function useWallets() {
    const swr = useSWR('com.maskbook.wallet.wallets', { fetcher: Services.Plugin.getWallets })
    const { revalidate } = swr
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    return swr
}
export function useTokens() {
    const swr = useSWR('com.maskbook.wallet.tokens', { fetcher: Services.Plugin.getTokens })
    const { revalidate } = swr
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    return swr
}
export function useCurrentEthChain() {
    const { data, revalidate } = useSWR('com.maskbook.wallet.eth-chain', {
        fetcher: Services.Plugin.getCurrentEthChain,
    })
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    useEffect(() => currentLocalWalletEthereumNetworkSettings.addListener(revalidate), [revalidate])
    return data ?? ChainId.Mainnet
}

export function useManagedWalletDetail(address: string) {
    const swr = useSWR(address, { fetcher: Services.Plugin.getManagedWallet })
    const { revalidate } = swr
    useEffect(() => PluginMessageCenter.on('maskbook.wallets.update', revalidate), [revalidate])
    return swr
}
export function useSelectWallet(wallets: WalletRecord[] | undefined, tokens: ERC20TokenDetails[] | undefined) {
    const network = useCurrentEthChain()
    const [selectedWalletAddress, setSelectedWalletAddress] = useState<undefined | string>(undefined)

    const [selectedTokenAddress, setSelectedTokenAddress] = useState(ETH_ADDRESS)
    const [selectedTokenType, setSelectedTokenType] = useState<EthereumTokenType>(EthereumTokenType.ETH)
    const selectedWallet = wallets?.find((x) => x.address === selectedWalletAddress)

    const availableTokens = (selectedWallet?.erc20_token_balance
        ? Array.from(selectedWallet.erc20_token_balance.entries())
        : []
    )
        .filter(([address]) => tokens?.find((x) => x.address === address && x.network === network))
        .map(([address, amount]) => ({ amount, ...tokens?.find((x) => x.address === address)! }))
    const selectedToken =
        selectedTokenType === EthereumTokenType.ETH
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
