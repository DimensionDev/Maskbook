import Service from '#services'
import { Trans, useLingui } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import { PersonaContext } from '@masknet/shared'
import { MaskMessages, PopupRoutes, currentSetupGuideStatus } from '@masknet/shared-base'
import { usePopupCustomSnackbar } from '@masknet/theme'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType } from '@masknet/web3-telemetry/types'
import { useQueryClient } from '@tanstack/react-query'
import { memo, useCallback, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DisconnectEventMap } from '../../../../shared/definitions/event.js'
import { PageTitleContext, useTitle } from '../../../hooks/index.js'
import { AccountDetailUI } from './UI.js'

export const Component = memo(() => {
    const { t } = useLingui()
    const navigate = useNavigate()
    const { selectedAccount, currentPersona } = PersonaContext.useContainer()
    const { setExtension } = useContext(PageTitleContext)

    const { showSnackbar } = usePopupCustomSnackbar()

    const queryClient = useQueryClient()
    const handleDetachProfile = useCallback(async () => {
        try {
            if (!selectedAccount?.identifier) return
            // false positive?
            // eslint-disable-next-line react-compiler/react-compiler
            currentSetupGuideStatus[selectedAccount.identifier.network].value = ''
            await Service.Identity.detachProfile(selectedAccount.identifier)
            MaskMessages.events.ownPersonaChanged.sendToAll()
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

    useTitle(t`Social Account`)

    useEffect(() => {
        if (!selectedAccount) navigate(PopupRoutes.Personas, { replace: true })
        setExtension(
            selectedAccount?.linkedPersona ?
                <Icons.Trash size={24} onClick={handleDetachProfile} />
            :   <Icons.Disconnect size={24} onClick={handleDetachProfile} />,
        )
        return () => setExtension(undefined)
    }, [selectedAccount, handleDetachProfile, currentPersona])

    if (!selectedAccount) return null

    return <AccountDetailUI account={selectedAccount} />
})
Component.displayName = 'AccountDetail'
