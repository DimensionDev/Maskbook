import { first } from 'lodash-es'
import { type ECKeyIdentifier, EMPTY_LIST, ExtensionSite, getSiteType, PopupRoutes } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, chainResolver, isValidAddress, ProviderType } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types.js'
import { BaseContractWalletProvider } from './BaseContractWallet.js'
import { SharedContextSettings, Web3StateSettings } from '../../../settings/index.js'
import { SmartPayBundler } from '@masknet/web3-providers'

export class MaskWalletProvider extends BaseContractWalletProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.MaskWallet)

        const getReadyPromise = async () => {
            await Web3StateSettings.readyPromise
            await Web3StateSettings.value.Wallet?.readyPromise
        }

        // the initial setup of selecting the primary wallet
        getReadyPromise().then(() => {
            Web3StateSettings.value.Wallet?.wallets?.subscribe(async () => {
                const primaryWallet = first(this.wallets)
                const smartPayChainId = await SmartPayBundler.getSupportedChainId()
                if (!this.hostedAccount && primaryWallet) {
                    await this.switchAccount(primaryWallet.address)
                    await this.switchChain(primaryWallet.owner ? smartPayChainId : ChainId.Mainnet)
                }
            })
        })
    }

    private get wallets() {
        return Web3StateSettings.value.Wallet?.wallets?.getCurrentValue() ?? EMPTY_LIST
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
