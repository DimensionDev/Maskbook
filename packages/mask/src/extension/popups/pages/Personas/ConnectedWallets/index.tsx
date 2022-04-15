import { memo, useEffect } from 'react'
import { useTitle } from '../../../hook/useTitle'
import { useI18N } from '../../../../../utils'
import { ConnectedWalletsUI } from './UI'
import { PersonaContext } from '../hooks/usePersonaContext'
import { useChainId, useWallets, useWeb3State } from '@masknet/plugin-infra/web3'
import { useNavigate } from 'react-router-dom'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { NextIDAction, NextIDPlatform, PopupRoutes } from '@masknet/shared-base'
import { useAsync, useAsyncFn } from 'react-use'
import { compact } from 'lodash-unified'
import type { ConnectedWalletInfo } from '../type'
import { NextIDProof } from '@masknet/web3-providers'
import Service from '../../../../service'

const ConnectedWallets = memo(() => {
    const { t } = useI18N()
    const chainId = useChainId()
    const { NameService } = useWeb3State()
    const navigate = useNavigate()
    const wallets = useWallets()
    const { proofs, currentPersona, refreshProofs } = PersonaContext.useContainer()

    const { value: connectedWallets } = useAsync(async () => {
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
                        name: `${x.platform} wallet ${index + 1}`,
                    }
                }
                return null
            }),
        )

        return compact(results)
    }, [wallets, NameService, proofs])

    const [confirmState, onConfirmRelease] = useAsyncFn(
        async (wallet?: ConnectedWalletInfo) => {
            if (!currentPersona?.publicHexKey || !wallet) return

            const result = await NextIDProof.createPersonaPayload(
                currentPersona.publicHexKey,
                NextIDAction.Delete,
                wallet.identity,
                wallet.platform,
            )

            if (!result) return

            const signature = await Service.Identity.generateSignResult(currentPersona.identifier, result.signPayload)

            if (!signature) return

            await NextIDProof.bindProof(
                result.uuid,
                currentPersona.publicHexKey,
                NextIDAction.Delete,
                wallet.platform,
                wallet.identity,
                result.createdAt,
                { signature: signature.signature.signature },
            )

            refreshProofs()
        },
        [currentPersona],
    )

    const navigateToConnectWallet = () => {
        navigate(PopupRoutes.ConnectWallet)
    }

    useTitle(t('popups_connected_wallets'))

    useEffect(() => {
        if (!proofs) navigate(PopupRoutes.Personas)
    }, [proofs])

    if (!proofs || !connectedWallets || !currentPersona) return null

    return (
        <ConnectedWalletsUI
            wallets={connectedWallets}
            chainId={chainId}
            releaseLoading={confirmState.loading}
            onRelease={onConfirmRelease}
            onAddVerifyWallet={navigateToConnectWallet}
            personaName={currentPersona.nickname}
        />
    )
})

export default ConnectedWallets
