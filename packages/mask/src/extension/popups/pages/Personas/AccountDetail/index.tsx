import { memo, useEffect, useState } from 'react'
import { useTitle } from '../../../hook/useTitle'
import { useI18N } from '../../../../../utils'
import { PersonaContext } from '../hooks/usePersonaContext'
import { useNavigate } from 'react-router-dom'
import { NextIDAction, PopupRoutes } from '@masknet/shared-base'
import { AccountDetailUI } from './UI'
import { useAsyncFn } from 'react-use'
import Service from '../../../../service'
import { DisconnectDialog } from '../components/DisconnectDialog'
import { NextIDProof } from '@masknet/web3-providers'
import { SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID } from '@masknet/shared'

const AccountDetail = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { selectedAccount, currentPersona } = PersonaContext.useContainer()
    const [open, setOpen] = useState(false)

    const [disconnectState, onDisconnect] = useAsyncFn(async () => {
        if (!selectedAccount?.identifier) return

        if (
            SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID.includes(selectedAccount.identifier.network) &&
            selectedAccount.is_valid
        ) {
            setOpen(true)
            return
        }
        await Service.Identity.detachProfile(selectedAccount.identifier)
        navigate(PopupRoutes.SocialAccounts)
    }, [selectedAccount])

    const [confirmState, onConfirmReleaseBind] = useAsyncFn(async () => {
        try {
            if (!currentPersona?.publicHexKey || !selectedAccount?.identity || !selectedAccount?.platform) return

            const result = await NextIDProof.createPersonaPayload(
                currentPersona.publicHexKey,
                NextIDAction.Delete,
                selectedAccount.identity,
                selectedAccount.platform,
            )

            if (!result) return

            const signature = await Service.Identity.generateSignResult(currentPersona.identifier, result.signPayload)

            if (!signature) return

            await Service.Identity.detachProfileWithNextID(
                result.uuid,
                currentPersona.publicHexKey,
                selectedAccount.platform,
                selectedAccount.identity,
                result.createdAt,
                { signature: signature.signature.signature },
            )

            await Service.Identity.detachProfile(selectedAccount.identifier)

            navigate(PopupRoutes.SocialAccounts)
        } catch {
            console.log('Disconnect failed')
        }
    }, [selectedAccount, currentPersona])

    const [, onVerify] = useAsyncFn(async () => {
        if (!selectedAccount?.identifier || !currentPersona?.identifier) return
        await Service.SocialNetwork.connectSocialNetwork(
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
