import { pick, noop } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { ChainId, ProviderType } from '@dimensiondev/web3-shared'
import { ERC20TokenDetailed, EthereumTokenType, NetworkType, Wallet, Web3ProviderType } from '@dimensiondev/web3-shared'
import { Messages, PluginMessages, PluginServices, Services } from '../API'

const Web3Provider = createExternalProvider()

export const Web3Context: Web3ProviderType = {
    provider: {
        getCurrentValue: () => Web3Provider,
        subscribe: () => noop,
    },
    allowTestChain: createSubscriptionAsync(
        Services.Settings.getWalletAllowTestChain,
        false,
        Messages.events.createInternalSettingsChanged.on,
    ),
    account: createSubscriptionAsync(
        Services.Settings.getSelectedWalletAddress,
        '',
        Messages.events.createInternalSettingsChanged.on,
    ),
    nonce: createSubscriptionAsync(
        Services.Settings.getBlockNumber,
        0,
        Messages.events.createInternalSettingsChanged.on,
    ),
    gasPrice: createSubscriptionAsync(
        Services.Settings.getBlockNumber,
        0,
        Messages.events.createInternalSettingsChanged.on,
    ),
    balance: createSubscriptionAsync(
        Services.Settings.getBalance,
        '0',
        Messages.events.createInternalSettingsChanged.on,
    ),
    blockNumber: createSubscriptionAsync(
        Services.Settings.getBlockNumber,
        0,
        Messages.events.createInternalSettingsChanged.on,
    ),
    chainId: createSubscriptionAsync(
        Services.Settings.getChainId,
        ChainId.Mainnet,
        Messages.events.createInternalSettingsChanged.on,
    ),
    providerType: createSubscriptionAsync(
        Services.Settings.getCurrentSelectedWalletProvider,
        ProviderType.Maskbook,
        Messages.events.createInternalSettingsChanged.on,
    ),
    networkType: createSubscriptionAsync(
        Services.Settings.getCurrentSelectedWalletNetwork,
        NetworkType.Ethereum,
        Messages.events.createInternalSettingsChanged.on,
    ),
    wallets: createSubscriptionAsync(getWallets, [], PluginMessages.Wallet.events.walletsUpdated.on),
    erc20Tokens: createSubscriptionAsync(getERC20Tokens, [], PluginMessages.Wallet.events.erc20TokensUpdated.on),
    erc721Tokens: createSubscriptionAsync(getERC721Tokens, [], PluginMessages.Wallet.events.erc721TokensUpdated.on),
}

export function createExternalProvider() {
    return {
        isMetaMask: false,
        isStatus: true,
        host: '',
        path: '',
        request: Services.Ethereum.request,
        send: Services.Ethereum.requestSend,
        sendAsync: Services.Ethereum.requestSend,
    }
}

async function getWallets() {
    const raw = await PluginServices.Wallet.getWallets()
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
    const raw = await PluginServices.Wallet.getERC20Tokens()
    return raw.map<ERC20TokenDetailed>((x) => ({
        type: EthereumTokenType.ERC20,
        ...x,
    }))
}

async function getERC721Tokens() {
    return []
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
