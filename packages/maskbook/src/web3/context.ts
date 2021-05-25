import { ChainId, Wallet, Web3ProviderType } from '@dimensiondev/web3-shared'
import Services from '../extension/service'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
import { currentSelectedWalletAddressSettings, currentSelectedWalletProviderSettings } from '../plugins/Wallet/settings'
import { noop, pick } from 'lodash-es'
import { Flags } from '../utils/flags'
import type { Subscription } from 'use-subscription'
import type { InternalSettings } from '../settings/createSettings'

export const Web3Context: Web3ProviderType = {
    allowTestChain: {
        getCurrentValue: () => !Flags.wallet_allow_test_chain,
        subscribe: () => noop,
    },
    currentChain: createSubscriptionAsync(
        Services.Ethereum.getChainId,
        ChainId.Mainnet,
        WalletMessages.events.chainIdUpdated.on,
    ),
    walletProvider: createSubscriptionFromSettings(currentSelectedWalletProviderSettings),
    wallets: createSubscriptionAsync(getWallets, [], WalletMessages.events.walletsUpdated.on),
    selectedWalletAddress: createSubscriptionFromSettings(currentSelectedWalletAddressSettings),
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
        hasPrivateKey: Boolean(record._private_key_ || record.mnemonic),
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
            const b = settings.addListener(trigger)
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
