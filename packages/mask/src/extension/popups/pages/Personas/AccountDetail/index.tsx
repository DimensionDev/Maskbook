import { memo, useEffect, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router-dom'
import {
    type EnhanceableSite,
    NextIDAction,
    PopupRoutes,
    SignType,
    SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { usePopupCustomSnackbar } from '@masknet/theme'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/index.js'
import { AccountDetailUI } from './UI.js'
import Service from '../../../../service.js'
import { DisconnectDialog } from '../components/DisconnectDialog/index.js'
import { PersonaContext } from '@masknet/shared'

const AccountDetail = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { selectedAccount, currentPersona } = PersonaContext.useContainer()
    const [open, setOpen] = useState(false)

    const { showSnackbar } = usePopupCustomSnackbar()

    const isSupportNextDotID = selectedAccount
        ? SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID.includes(selectedAccount.identifier.network as EnhanceableSite)
        : false

    const [disconnectState, onDisconnect] = useAsyncFn(async () => {
        try {
            if (!selectedAccount?.identifier) return

            if (isSupportNextDotID && selectedAccount.is_valid) {
                setOpen(true)
                return
            }
            await Service.Identity.detachProfile(selectedAccount.identifier)
            showSnackbar(t('popups_disconnect_success'), {
                variant: 'success',
            })
            navigate(-1)
        } catch {
            showSnackbar(t('popups_disconnect_failed'), {
                variant: 'error',
            })
        }
    }, [selectedAccount])

    const [confirmState, onConfirmReleaseBind] = useAsyncFn(async () => {
        try {
            if (!currentPersona?.identifier.publicKeyAsHex || !selectedAccount?.identity || !selectedAccount?.platform)
                return

            const result = await NextIDProof.createPersonaPayload(
                currentPersona.identifier.publicKeyAsHex,
                NextIDAction.Delete,
                selectedAccount.identity,
                selectedAccount.platform,
            )

            if (!result) return

            const signature = await Service.Identity.signWithPersona(
                SignType.Message,
                result.signPayload,
                currentPersona.identifier,
                true,
            )

            if (!signature) return

            await Service.Identity.detachProfileWithNextID(
                result.uuid,
                currentPersona.identifier.publicKeyAsHex,
                selectedAccount.platform,
                selectedAccount.identity,
                result.createdAt,
                { signature },
            )

            await Service.Identity.detachProfile(selectedAccount.identifier)
            showSnackbar(t('popups_disconnect_success'), {
                variant: 'success',
            })
            navigate(-1)
        } catch {
            showSnackbar(t('popups_disconnect_failed'), {
                variant: 'error',
            })
        }
    }, [selectedAccount, currentPersona])

    const [, onVerify] = useAsyncFn(async () => {
        if (!selectedAccount?.identifier || !currentPersona?.identifier) return
        await Service.SocialNetwork.connectSite(
            currentPersona.identifier,
            selectedAccount.identifier.network,
            'nextID',
            selectedAccount.identifier,
        )
        window.close()
    }, [selectedAccount, currentPersona])

    useTitle(t('popups_social_account'))

    useEffect(() => {
        if (!selectedAccount) navigate(PopupRoutes.Personas, { replace: true })
    }, [selectedAccount])

    if (!selectedAccount) return null

    return (
        <>
            <AccountDetailUI
                account={selectedAccount}
                personaName={currentPersona?.nickname}
                onVerify={onVerify}
                onDisconnect={onDisconnect}
                disconnectLoading={disconnectState.loading}
                isSupportNextDotID={isSupportNextDotID}
            />
            <DisconnectDialog
                unbundledIdentity={selectedAccount.identifier}
                onConfirmDisconnect={onConfirmReleaseBind}
                confirmLoading={confirmState.loading}
                onClose={() => setOpen(false)}
                open={open}
            />
        </>
    )
})

export default AccountDetail
