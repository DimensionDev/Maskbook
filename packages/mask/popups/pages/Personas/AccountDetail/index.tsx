import Service from '#services'
import { Trans, useLingui } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import { ConfirmDialog, PersonaContext } from '@masknet/shared'
import {
    MaskMessages,
    NextIDAction,
    PopupRoutes,
    SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID,
    SignType,
    currentSetupGuideStatus,
    type EnhanceableSite,
} from '@masknet/shared-base'
import { usePopupCustomSnackbar } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType } from '@masknet/web3-telemetry/types'
import { useTheme } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { memo, useCallback, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DisconnectEventMap } from '../../../../shared/definitions/event.js'
import { PageTitleContext, useTitle } from '../../../hooks/index.js'
import { AccountDetailUI } from './UI.js'

export const Component = memo(() => {
    const { t } = useLingui()
    const navigate = useNavigate()
    const theme = useTheme()
    const { selectedAccount, currentPersona, walletProofs } = PersonaContext.useContainer()
    const { setExtension } = useContext(PageTitleContext)

    const { showSnackbar } = usePopupCustomSnackbar()

    const isSupportNextDotID =
        selectedAccount ?
            SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID.includes(selectedAccount.identifier.network as EnhanceableSite)
        :   false

    const queryClient = useQueryClient()
    const handleDetachProfile = useCallback(async () => {
        try {
            if (!selectedAccount?.identifier) return
            // false positive?
            // eslint-disable-next-line react-compiler/react-compiler
            currentSetupGuideStatus[selectedAccount.identifier.network].value = ''
            await Service.Identity.detachProfile(selectedAccount.identifier)
            MaskMessages.events.ownPersonaChanged.sendToAll()
            queryClient.removeQueries({ queryKey: ['@@next-id', 'bindings-by-persona', pubkey] })
            queryClient.removeQueries({ queryKey: ['@@my-own-persona-info'] })
            showSnackbar(<Trans>Disconnected.</Trans>, {
                variant: 'success',
            })
            Telemetry.captureEvent(EventType.Access, DisconnectEventMap[selectedAccount.identifier.network])
            await delay(300)
            navigate(-1)
        } catch {
            showSnackbar(<Trans>Disconnect failed.</Trans>, {
                variant: 'error',
            })
        }
    }, [selectedAccount, queryClient])

    const pubkey = currentPersona?.identifier.publicKeyAsHex
    const releaseBinding = useCallback(async () => {
        try {
            if (!pubkey || !selectedAccount?.identity || !selectedAccount.platform) return

            const result = await NextIDProof.createPersonaPayload(
                pubkey,
                NextIDAction.Delete,
                selectedAccount.identity,
                selectedAccount.platform,
            )

            if (!result) return

            const signature = await Service.Identity.signWithPersona(
                { type: SignType.Message, data: result.signPayload },
                currentPersona.identifier,
                location.origin,
                true,
            )

            if (!signature) return

            await Service.Identity.detachProfileWithNextID(
                result.uuid,
                pubkey,
                selectedAccount.platform,
                selectedAccount.identity,
                result.createdAt,
                { signature },
            )

            await Service.Identity.detachProfile(selectedAccount.identifier)
            currentSetupGuideStatus[selectedAccount.identifier.network].value = ''
            await delay(1000)

            // Broadcast updates
            MaskMessages.events.ownProofChanged.sendToAll()
            MaskMessages.events.ownPersonaChanged.sendToAll()
            await queryClient.refetchQueries({ queryKey: ['@@next-id', 'bindings-by-persona', pubkey] })
            await queryClient.refetchQueries({ queryKey: ['@@my-own-persona-info'] })

            showSnackbar(<Trans>Disconnected.</Trans>, {
                variant: 'success',
            })
            navigate(-1)
        } catch {
            showSnackbar(<Trans>Disconnect failed.</Trans>, {
                variant: 'error',
            })
        }
    }, [selectedAccount, currentPersona])

    useTitle(t`Social Account`)

    useEffect(() => {
        if (!selectedAccount) navigate(PopupRoutes.Personas, { replace: true })
        setExtension(
            !selectedAccount?.is_valid && selectedAccount?.linkedPersona ?
                <Icons.Trash size={24} onClick={handleDetachProfile} />
            :   <Icons.Disconnect
                    size={24}
                    onClick={async () => {
                        if (!currentPersona) return
                        const confirmed = await ConfirmDialog.openAndWaitForClose({
                            title: <Trans>Disconnect Social Account?</Trans>,
                            confirmVariant: 'warning',
                            message: (
                                <Trans>
                                    Do you want to remove the verified association between the X account @
                                    <strong style={{ color: theme.palette.maskColor.main, wordBreak: 'keep-all' }}>
                                        {selectedAccount?.identifier.userId}
                                    </strong>{' '}
                                    and {currentPersona.nickname}?
                                </Trans>
                            ),
                        })
                        if (confirmed) {
                            await releaseBinding()
                        }
                    }}
                />,
        )
        return () => setExtension(undefined)
    }, [selectedAccount, handleDetachProfile, currentPersona, releaseBinding])

    if (!selectedAccount) return null

    return (
        <AccountDetailUI
            account={selectedAccount}
            isSupportNextDotID={isSupportNextDotID}
            walletProofs={walletProofs}
        />
    )
})
Component.displayName = 'AccountDetail'
