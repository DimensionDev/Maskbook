import { compact, first, isEqual, uniqWith } from 'lodash-es'
import {
    createSubscriptionFromValueRef,
    CrossIsolationMessages,
    ECKeyIdentifier,
    EMPTY_LIST,
    ExtensionSite,
    getSiteType,
    PopupRoutes,
    ValueRef,
} from '@masknet/shared-base'
import { isSameAddress, Wallet } from '@masknet/web3-shared-base'
import { SmartPayBundler, SmartPayOwner } from '@masknet/web3-providers'
import { ChainId, chainResolver, isValidAddress, ProviderType } from '@masknet/web3-shared-evm'
import { BaseContractWalletProvider } from './BaseContractWallet.js'
import { SharedContextSettings } from '../../../settings/index.js'
import type { EVM_Provider } from '../types.js'

export class MaskWalletProvider extends BaseContractWalletProvider implements EVM_Provider {
    private ref = new ValueRef<Wallet[]>(EMPTY_LIST)

    constructor() {
        super(ProviderType.MaskWallet)
    }

    override get subscription() {
        return {
            ...super.subscription,
            wallets: createSubscriptionFromValueRef(this.ref),
        }
    }

    override get wallets() {
        return this.subscription.wallets.getCurrentValue()
    }

    override async setup() {
        await super.setup()

        this.subscription?.wallets?.subscribe(async () => {
            const primaryWallet = first(this.wallets)
            const smartPayChainId = await SmartPayBundler.getSupportedChainId()
            if (!this.hostedAccount && primaryWallet) {
                await this.switchAccount(primaryWallet.address)
                await this.switchChain(primaryWallet.owner ? smartPayChainId : ChainId.Mainnet)
            }
        })

        const update = async () => {
            const wallets = SharedContextSettings.value.wallets.getCurrentValue()

            // speed up first paint
            this.ref.value = uniqWith([...wallets, ...super.wallets], (a, b) => isSameAddress(a.address, b.address))

            const allPersonas = SharedContextSettings.value.allPersonas?.getCurrentValue() ?? []
            const chainId = await SmartPayBundler.getSupportedChainId()
            const accounts = await SmartPayOwner.getAccountsByOwners(chainId, [
                ...this.wallets.map((x) => x.address),
                ...compact(allPersonas.map((x) => x.address)),
            ])

            const now = new Date()
            const smartPayWallets = accounts
                .filter((x) => x.deployed)
                .map((x) => ({
                    id: x.address,
                    name: super.wallets.find((item) => isSameAddress(item.address, x.address))?.name ?? 'Smart Pay',
                    address: x.address,
                    hasDerivationPath: false,
                    hasStoredKeyInfo: false,
                    configurable: true,
                    createdAt: now,
                    updatedAt: now,
                    owner: x.owner,
                    deployed: x.deployed,
                    identifier: allPersonas
                        .find((persona) => isSameAddress(x.owner, persona.address))
                        ?.identifier.toText(),
                }))

            const result = uniqWith([...wallets, ...super.wallets, ...smartPayWallets], (a, b) =>
                isSameAddress(a.address, b.address),
            )

            if (!isEqual(result, super.wallets)) {
                await this.updateWallets(result)
            }

            this.ref.value = result
        }

        update()
        SharedContextSettings.value.wallets.subscribe(update)
        SharedContextSettings.value.allPersonas?.subscribe(update)
        CrossIsolationMessages.events.renameWallet.on(update)
    }

    override async addWallet(wallet: Wallet): Promise<void> {
        await SharedContextSettings.value.addWallet(wallet.address, wallet)
    }

    override async removeWallet(address: string, password?: string | undefined): Promise<void> {
        const scWallets = this.wallets.filter((x) => isSameAddress(x.owner, address))
        if (scWallets.length) await super.removeWallets(scWallets)
        await super.removeWallet(address, password)
        await SharedContextSettings.value.removeWallet(address, password)
    }

    override async renameWallet(address: string, name: string) {
        await super.renameWallet(address, name)
        CrossIsolationMessages.events.renameWallet.sendToAll({})
    }

    override async connect(
        chainId: ChainId,
        address?: string,
        owner?: {
            account: string
            identifier?: ECKeyIdentifier
        },
        silent?: boolean,
    ) {
        const siteType = getSiteType()
        if (siteType === ExtensionSite.Popup || silent) {
            if (isValidAddress(address)) {
                await this.switchAccount(address, owner)
                await this.switchChain(chainId)

                if (siteType) await SharedContextSettings.value.recordConnectedSites(siteType, true)

                return {
                    account: address,
                    chainId,
                }
            }

            return {
                account: this.hostedAccount,
                chainId: this.hostedChainId,
            }
        }

        await SharedContextSettings.value.openPopupWindow(
            this.wallets.length ? PopupRoutes.SelectWallet : PopupRoutes.Wallet,
            {
                chainId,
            },
        )

        const account = first(await SharedContextSettings.value.selectAccount())
        if (!account) throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}`)

        // switch account
        if (!isSameAddress(this.hostedAccount, account?.address)) {
            await this.switchAccount(
                account.address,
                account.owner
                    ? {
                          account: account.owner,
                          identifier: account.identifier,
                      }
                    : undefined,
            )
        }

        // switch chain
        if (chainId !== this.hostedChainId) {
            await this.switchChain(chainId)
        }

        if (siteType) await SharedContextSettings.value.recordConnectedSites(siteType, true)

        return {
            chainId,
            account: account.address,
        }
    }

    override async disconnect() {
        const siteType = getSiteType()
        if (siteType) await SharedContextSettings.value.recordConnectedSites(siteType, false)
    }
}
