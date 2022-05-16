import { memo } from 'react'
import { useTitle } from '../../../hook/useTitle'
import { useI18N } from '../../../../../utils'
import { ConnectedWalletsUI } from './UI'
import { PersonaContext } from '../hooks/usePersonaContext'
import { useChainId, useWallets, useWeb3State } from '@masknet/plugin-infra/web3'
import { NextIDAction, NextIDPlatform, PopupRoutes } from '@masknet/shared-base'
import { useAsync, useAsyncFn } from 'react-use'
import { compact, sortBy } from 'lodash-unified'
import type { ConnectedWalletInfo } from '../type'
import { NextIDProof } from '@masknet/web3-providers'
import Service from '../../../../service'
import { usePopupCustomSnackbar } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'

const ConnectedWallets = memo(() => {
    const { t } = useI18N()
    const chainId = useChainId()
    const { NameService } = useWeb3State()
    const wallets = useWallets()
    const { proofs, currentPersona, refreshProofs, fetchProofsLoading } = PersonaContext.useContainer()

    const { showSnackbar } = usePopupCustomSnackbar()

    const { value: connectedWallets, loading: resolveWalletNameLoading } = useAsync(async () => {
        if (!proofs) return []

        const results = await Promise.all(
            proofs.map(async (x, index) => {
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

        return sortBy(compact(results), (x) => Number(x.created_at))
            .map((x, index) => {
                if (!x.name)
                    return {
                        ...x,
                        name: `${x.platform} wallet ${index + 1}`,
                    }

                return x
            })
            .reverse()
    }, [wallets, NameService, proofs])

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

                const signature = await Service.Identity.generateSignResult(
                    currentPersona.identifier,
                    result.signPayload,
                )

                if (!signature) return

                await NextIDProof.bindProof(
                    result.uuid,
                    currentPersona.identifier.publicKeyAsHex,
                    NextIDAction.Delete,
                    wallet.platform,
                    wallet.identity,
                    result.createdAt,
                    { signature: signature.signature.signature },
                )

                showSnackbar(t('popups_wallet_disconnect_success'))
                refreshProofs()
            } catch {
                showSnackbar(t('popups_wallet_disconnect_failed'))
            }
        },
        [currentPersona],
    )

    const navigateToConnectWallet = async () => {
        await Service.Helper.openPopupWindow(PopupRoutes.ConnectWallet)
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
