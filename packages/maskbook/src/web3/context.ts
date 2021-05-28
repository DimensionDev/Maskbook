import { noop, pick } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { ChainId, ERC20TokenDetailed, EthereumTokenType, Wallet, Web3ProviderType } from '@dimensiondev/web3-shared'
import Services from '../extension/service'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
import {
    currentBlockNumberSettings,
    currentSelectedWalletAddressSettings,
    currentSelectedWalletNetworkSettings,
    currentSelectedWalletProviderSettings,
} from '../plugins/Wallet/settings'
import { Flags } from '../utils'
import type { InternalSettings } from '../settings/createSettings'
import { createExternalProvider } from './web3'

export const Web3Context: Web3ProviderType = {
    provider: {
        getCurrentValue: createExternalProvider,
        subscribe: () => noop,
    },
    allowTestChain: {
        getCurrentValue: () => Flags.wallet_allow_test_chain,
        subscribe: () => noop,
    },
    chainId: createSubscriptionAsync(
        Services.Ethereum.getChainId,
        ChainId.Mainnet,
        WalletMessages.events.chainIdUpdated.on,
    ),
    account: createSubscriptionFromSettings(currentSelectedWalletAddressSettings),
    blockNumber: createSubscriptionFromSettings(currentBlockNumberSettings),
    wallets: createSubscriptionAsync(getWallets, [], WalletMessages.events.walletsUpdated.on),
    providerType: createSubscriptionFromSettings(currentSelectedWalletProviderSettings),
    networkType: createSubscriptionFromSettings(currentSelectedWalletNetworkSettings),
    erc20Tokens: createSubscriptionAsync(getERC20Tokens, [], WalletMessages.events.erc20TokensUpdated.on),
}

async function getWallets() {
    const raw = await WalletRPC.getWallets()
    return raw.map<Wallet>((record) => ({
        ...pick(record, [
            'address',
            'name',
            'erc1155_token_whitelist',
            'erc1155_token_blacklist',
            'erc20_token_whitelist',
            'erc20_token_blacklist',
            'erc721_token_whitelist',
            'erc721_token_blacklist',
        ] as (keyof typeof record)[]),
        hasPrivateKey: Boolean(record._private_key_ || record.mnemonic.length),
    }))
}

async function getERC20Tokens() {
    const raw = await WalletRPC.getERC20Tokens()
    return raw.map<ERC20TokenDetailed>((x) => ({
        type: EthereumTokenType.ERC20,
        ...x,
    }))
}
// utils
function createSubscriptionFromSettings<T>(settings: InternalSettings<T>): Subscription<T> {
    const { trigger, subscribe } = getEventTarget()
    settings.readyPromise.finally(trigger)
    return {
        getCurrentValue: () => settings.value,
        subscribe: (f) => {
            const a = subscribe(f)
            const b = settings.addListener(() => trigger())
            return () => void [a(), b()]
        },
    }
}
function createSubscriptionAsync<T>(
    f: () => Promise<T>,
    defaultValue: T,
    onChange: (callback: () => void) => () => void,
): Subscription<T> {
    let state = defaultValue
    const { subscribe, trigger } = getEventTarget()
    f()
        .then((v) => (state = v))
        .finally(trigger)
    return {
        getCurrentValue: () => state,
        subscribe: (sub) => {
            const a = subscribe(sub)
            const b = onChange(async () => {
                state = await f()
                sub()
            })
            return () => void [a(), b()]
        },
    }
}
function getEventTarget() {
    const event = new EventTarget()
    const EVENT = 'event'
    function trigger() {
        event.dispatchEvent(new Event(EVENT))
    }
    function subscribe(f: () => void) {
        event.addEventListener(EVENT, f)
        return () => event.removeEventListener(EVENT, f)
    }
    return { trigger, subscribe }
}
