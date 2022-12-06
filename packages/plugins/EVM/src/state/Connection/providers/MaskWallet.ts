import { first } from 'lodash-es'
import { toHex } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { ChainId, chainResolver, ProviderType, isValidAddress, PayloadEditor } from '@masknet/web3-shared-evm'
import { ExtensionSite, getSiteType, isEnhanceableSiteType, PopupRoutes } from '@masknet/shared-base'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import { BaseProvider } from './Base.js'
import type { EVM_Provider } from '../types.js'
import { SharedContextSettings, Web3StateSettings } from '../../../settings/index.js'

export class MaskWalletProvider extends BaseProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.MaskWallet)
        Web3StateSettings.readyPromise.then(this.addSharedContextListeners.bind(this))
    }

    private get account() {
        return SharedContextSettings.value.account.getCurrentValue()
    }

    private get chainId() {
        return SharedContextSettings.value.chainId.getCurrentValue()
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

    private addSharedContextListeners() {
        const { account, chainId } = SharedContextSettings.value

        account.subscribe(() => {
            if (this.account) this.emitter.emit('accounts', [this.account])
            else this.emitter.emit('disconnect', ProviderType.MaskWallet)
        })
        chainId.subscribe(() => {
            this.emitter.emit('chainId', toHex(this.chainId))
        })
    }

    override async switchChain(chainId?: ChainId) {
        await SharedContextSettings.value.updateAccount({
            chainId,
        })
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        const response = await SharedContextSettings.value.send(
            PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill(),
            {
                chainId: this.chainId,
                popupsWindow: getSiteType() === ExtensionSite.Dashboard || isEnhanceableSiteType(),
                ...options,
            },
        )
        return response?.result as T
    }

    override async connect(chainId: ChainId) {
        const siteType = getSiteType()

        // connected
        if (chainId === this.chainId && isValidAddress(this.account)) {
            if (siteType) SharedContextSettings.value.recordConnectedSites(siteType, true)
            return {
                account: this.account,
                chainId: this.chainId,
            }
        }

        const { getWallets, updateAccount } = SharedContextSettings.value
        const wallets = await getWallets()
        SharedContextSettings.value.openPopupWindow(wallets.length ? PopupRoutes.SelectWallet : PopupRoutes.Wallet, {
            chainId,
        })

        const account = first(await SharedContextSettings.value.selectAccount())
        if (!account) throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)

        // switch chain
        if (chainId !== this.chainId) {
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
