import { toHex } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { ChainId, createPayload, chainResolver, ProviderType } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base'
import type { EVM_Provider } from '../types'
import { SharedContextSettings, Web3StateSettings } from '../../../settings'
import { ExtensionSite, getSiteType, isEnhanceableSiteType, PopupRoutes } from '@masknet/shared-base'
import { first } from 'lodash-unified'
import type { ProviderOptions } from '@masknet/web3-shared-base'

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
            const account = sharedContext.account.getCurrentValue()
            if (account) this.emitter.emit('accounts', [account])
            else this.emitter.emit('disconnect', ProviderType.MaskWallet)
        })
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        const response = await SharedContextSettings.value.send(
            createPayload(0, requestArguments.method, requestArguments.params),
            {
                chainId: SharedContextSettings.value.chainId.getCurrentValue(),
                popupsWindow: getSiteType() === ExtensionSite.Dashboard || isEnhanceableSiteType(),
                ...options,
            },
        )
        return response?.result as T
    }

    override async connect(chainId: ChainId) {
        const { chainId: actualChainId, getWallets, updateAccount } = SharedContextSettings.value

        const siteType = getSiteType()
        if (siteType === ExtensionSite.Popup) throw new Error('Cannot connect wallet')

        const wallets = await getWallets()
        SharedContextSettings.value.openPopupWindow(wallets.length ? PopupRoutes.SelectWallet : PopupRoutes.Wallet, {
            chainId,
        })

        const account = first(await SharedContextSettings.value.selectAccount())
        if (!account) throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)

        // switch chain
        if (actualChainId.getCurrentValue() !== chainId) {
            await updateAccount({
                chainId,
            })
        }

        if (siteType) SharedContextSettings.value.recordConnectedSites(siteType, true)

        return {
            chainId,
            account,
        }
    }

    override async disconnect() {
        const siteType = getSiteType()
        if (siteType) SharedContextSettings.value.recordConnectedSites(siteType, false)
    }
}
