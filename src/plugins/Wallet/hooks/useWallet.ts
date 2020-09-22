import { ValueRef } from '@holoflows/kit/es'
import { useState, useEffect } from 'react'
import { PluginMessageCenter } from '../../PluginMessages'
import Services from '../../../extension/service'
import { EthereumTokenType, ProviderType } from '../../../web3/types'
import type { ERC20TokenDetails } from '../../../extension/background-script/PluginService'
import { formatBalance } from '../formatter'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useChainId } from '../../../web3/hooks/useChainId'
import { CONSTANTS } from '../../../web3/constants'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { WalletRecord, ERC20TokenRecord } from '../database/types'
import { WalletArrayComparer, TokenComparer, WalletComparer, TokenArrayComparer } from '../helpers'

//#region cache service query result
const defaultWalletRef = new ValueRef<WalletRecord | null>(null, WalletComparer)
const walletsRef = new ValueRef<WalletRecord[]>([], WalletArrayComparer)
const tokensRef = new ValueRef<ERC20TokenRecord[]>([], TokenArrayComparer)
const walletRefs = new Map<string, ValueRef<WalletRecord>>()

async function revalidate() {
    // wallets
    const wallets = await Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets')
    wallets.forEach((x) => {
        const key = x.address.toLowerCase()
        const walletRef = walletRefs.get(key)
        if (walletRef) walletRef.value = x
        else walletRefs.set(key, new ValueRef(x, WalletComparer))
    })
    defaultWalletRef.value = wallets.find((x) => x._wallet_is_default) ?? wallets[0] ?? null
    walletsRef.value = wallets

    // tokens
    const tokens = await Services.Plugin.invokePlugin('maskbook.wallet', 'getTokens')
    tokensRef.value = tokens
}
PluginMessageCenter.on('maskbook.wallets.update', revalidate)
revalidate()
//#endregion

export function useDefaultWallet() {
    return useValueRef(defaultWalletRef)
}

export function useWallet(address: string) {
    return useValueRef(walletRefs.get(address) ?? new ValueRef(null))
}

export function useTokens() {
    return useValueRef(tokensRef)
}

export function useWallets(provider?: ProviderType) {
    const wallets = useValueRef(walletsRef)
    if (typeof provider === 'undefined') return wallets
    return wallets.filter((x) => x.provider === provider)
}

export function useSelectWallet(wallets: WalletRecord[] | undefined, tokens: ERC20TokenDetails[] | undefined) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')

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
