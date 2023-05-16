import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import { memo } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { useLocation } from 'react-router-dom'
import { usePopupCustomSnackbar } from '@masknet/theme'
import { useChainContext, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { isSameAddress, isGreaterThan } from '@masknet/web3-shared-base'
import { NetworkPluginID, NextIDAction, NextIDPlatform, PopupRoutes, SignType } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/index.js'
import { ConnectedWalletsUI } from './UI.js'
import { PersonaContext } from '../hooks/usePersonaContext.js'
import type { ConnectedWalletInfo } from '../type.js'
import Service from '../../../../service.js'
import { MaskMessages } from '../../../../../../shared/messages.js'

const ConnectedWallets = memo(() => {
    const { t } = useI18N()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { NameService } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const location = useLocation()
    const { proofs, currentPersona, fetchProofsLoading } = PersonaContext.useContainer()

    const { showSnackbar } = usePopupCustomSnackbar()

    const { value: connectedWallets, loading: resolveWalletNameLoading } = useAsync(async () => {
        if (!proofs) return []

        const results = await Promise.all(
            proofs.map(async (x) => {
                if (x.platform === NextIDPlatform.Ethereum) {
                    const domain = await NameService?.reverse?.(x.identity)

                    if (domain)
                        return {
                            ...x,
                            name: domain,
                        }

                    const wallet = wallets.find((wallet) => isSameAddress(wallet.address, x.identity))

                    if (wallet)
                        return {
                            ...x,
                            name: wallet.name,
                        }

                    return {
                        ...x,
                        name: '',
                    }
                }
                return null
            }),
        )

        return compact(results)
            .sort((a, z) => (isGreaterThan(a.last_checked_at, z.last_checked_at) ? -1 : 1))
            .map((x, index, list) => {
                if (!x.name)
                    return {
                        ...x,
                        name: `${x.platform} wallet ${list.length - index}`,
                    }

                return x
            })
    }, [wallets, NameService, proofs, chainId])

    const [confirmState, onConfirmRelease] = useAsyncFn(
        async (wallet?: ConnectedWalletInfo) => {
            try {
                if (!currentPersona?.identifier.publicKeyAsHex || !wallet) return

                const result = await NextIDProof.createPersonaPayload(
                    currentPersona.identifier.publicKeyAsHex,
                    NextIDAction.Delete,
                    wallet.identity,
                    wallet.platform,
                )

                if (!result) return

                const signature = await Service.Identity.signWithPersona(
                    SignType.Message,
                    result.signPayload,
                    currentPersona.identifier,
                    true,
                )

                if (!signature) return

                await NextIDProof.bindProof(
                    result.uuid,
                    currentPersona.identifier.publicKeyAsHex,
                    NextIDAction.Delete,
                    wallet.platform,
                    wallet.identity,
                    result.createdAt,
                    { signature },
                )
                // Broadcast updates.
                MaskMessages.events.ownProofChanged.sendToAll()
                showSnackbar(t('popups_wallet_disconnect_success'))
            } catch {
                showSnackbar(t('popups_wallet_disconnect_failed'))
            }
        },
        [currentPersona],
    )

    const navigateToConnectWallet = async () => {
        const params = new URLSearchParams(location.search)
        const internal = params.get('internal')

        if (internal) {
            window.open(urlcat('popups-connect.html#', PopupRoutes.ConnectWallet), '_self')
            return
        }
        await Service.Helper.openPopupConnectWindow()
        window.close()
    }

    useTitle(t('popups_connected_wallets'))

    return (
        <ConnectedWalletsUI
            wallets={connectedWallets}
            chainId={chainId}
            releaseLoading={confirmState.loading}
            onRelease={onConfirmRelease}
            onAddVerifyWallet={navigateToConnectWallet}
            personaName={currentPersona?.nickname}
            loading={fetchProofsLoading || resolveWalletNameLoading}
        />
    )
})

export default ConnectedWallets
