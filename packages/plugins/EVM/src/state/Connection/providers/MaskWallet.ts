import { toHex } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { ChainId, createPayload, chainResolver } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base'
import type { EVM_Provider } from '../types'
import { SharedContextSettings, Web3StateSettings } from '../../../settings'
import { ExtensionSite, getSiteType, isEnhanceableSiteType, PopupRoutes } from '@masknet/shared-base'

export class MaskWalletProvider extends BaseProvider implements EVM_Provider {
    constructor() {
        super()
        Web3StateSettings.readyPromise.then(this.addSharedContextListeners.bind(this))
    }

    /**
     * Block by the share context
     * @returns
     */
    override get ready() {
        return Web3StateSettings.ready
    }

    /**
     * Block by the share context
     * @returns
     */
    override get readyPromise() {
        return Web3StateSettings.readyPromise.then(() => {})
    }

    override async switchChain(chainId?: ChainId) {
        await SharedContextSettings.value.updateAccount({
            chainId,
        })
    }

    private addSharedContextListeners() {
        const sharedContext = SharedContextSettings.value

        sharedContext.chainId.subscribe(() => {
            this.emitter.emit('chainId', toHex(sharedContext.chainId.getCurrentValue()))
        })
        sharedContext.account.subscribe(() => {
            this.emitter.emit('accounts', [sharedContext.account.getCurrentValue()])
        })
    }

    override async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        const response = await SharedContextSettings.value.send(
            createPayload(0, requestArguments.method, requestArguments.params),
            {
                popupsWindow: getSiteType() === ExtensionSite.Dashboard || isEnhanceableSiteType(),
            },
        )
        return response?.result as T
    }

    override async connect(chainId: ChainId, popupsWindow?: boolean) {
        const { account, chainId: actualChainId, getWallets, updateAccount } = SharedContextSettings.value
        const wallets = await getWallets()
        if (popupsWindow) {
            SharedContextSettings.value.openPopupWindow(
                wallets.length ? PopupRoutes.SelectWallet : PopupRoutes.Wallet,
                {
                    chainId,
                },
            )
        }
        const accounts = await SharedContextSettings.value.selectAccount()
        if (!accounts.length) throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)

        // switch chain
        if (actualChainId.getCurrentValue() !== chainId) {
            await updateAccount({
                chainId,
            })
        }

        return {
            chainId,
            account: account.getCurrentValue(),
        }
    }

    override async disconnect() {
        // do nothing
    }
}
