import Service from '#services'
import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import { ConfirmDialog, PersonaContext } from '@masknet/shared'
import {
    EMPTY_LIST,
    EMPTY_OBJECT,
    MaskMessages,
    NextIDAction,
    PluginID,
    PopupRoutes,
    SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID,
    SignType,
    currentSetupGuideStatus,
    type EnhanceableSite,
} from '@masknet/shared-base'
import { usePopupCustomSnackbar } from '@masknet/theme'
import { useUnlistedAddressConfig } from '@masknet/web3-hooks-base'
import { NextIDProof } from '@masknet/web3-providers'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType } from '@masknet/web3-telemetry/types'
import { useTheme } from '@mui/material'
import { useUpdateEffect } from '@react-hookz/web'
import { useQueryClient } from '@tanstack/react-query'
import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { MaskSharedTrans, requestPermissionFromExtensionPage, useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { DisconnectEventMap } from '../../../../shared/definitions/event.js'
import { PageTitleContext, useTitle } from '../../../hooks/index.js'
import { AccountDetailUI } from './UI.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const Component = memo(() => {
    const { _ } = useLingui()
    const t = useMaskSharedTrans()
    const navigate = useNavigate()
    const theme = useTheme()
    const { selectedAccount, currentPersona, walletProofs } = PersonaContext.useContainer()
    const { setExtension } = useContext(PageTitleContext)

    const [pendingUnlistedConfig, setPendingUnlistedConfig] = useState<Record<string, string[]>>({})

    const { showSnackbar } = usePopupCustomSnackbar()

    const isSupportNextDotID =
        selectedAccount ?
            SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID.includes(selectedAccount.identifier.network as EnhanceableSite)
        :   false

    const [{ data: unlistedAddressConfig = EMPTY_OBJECT, isLoading, refetch }, updateConfig] = useUnlistedAddressConfig(
        {
            identifier: currentPersona?.identifier,
            pluginID: PluginID.Web3Profile,
            socialIds:
                isSupportNextDotID && selectedAccount?.is_valid && selectedAccount.identity ?
                    [selectedAccount.identity]
                :   EMPTY_LIST,
        },
        (a, b, c, d) => Service.Identity.signWithPersona(a, b, c, location.origin, d),
    )

    const listingAddresses = useMemo(() => {
        if (!selectedAccount?.identity) return EMPTY_LIST
        const pendingUnlistedAddresses = pendingUnlistedConfig[selectedAccount.identity] ?? EMPTY_LIST
        const addresses = walletProofs.map((x) => x.identity)
        return addresses.filter((x) => !pendingUnlistedAddresses.includes(x))
    }, [pendingUnlistedConfig, selectedAccount])

    const toggleUnlisted = useCallback((identity: string, address: string) => {
        setPendingUnlistedConfig((config) => {
            const list = config[identity] ?? []
            return {
                ...config,
                [identity]: list.includes(address) ? list.filter((x) => x !== address) : [...list, address],
            }
        })
    }, [])

    const queryClient = useQueryClient()
    const handleDetachProfile = useCallback(async () => {
        try {
            if (!selectedAccount?.identifier) return
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

    const [{ loading: submitting }, handleSubmit] = useAsyncFn(async () => {
        try {
            await updateConfig(pendingUnlistedConfig)
            showSnackbar(<Trans>Saved</Trans>, {
                variant: 'success',
                autoHideDuration: 2000,
            })
        } catch {
            showSnackbar(<Trans>Save failed</Trans>, {
                variant: 'error',
            })
        }

        refetch()
    }, [pendingUnlistedConfig, t, updateConfig])

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
                SignType.Message,
                result.signPayload,
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

    const [, onVerify] = useAsyncFn(async () => {
        if (!selectedAccount?.identifier || !currentPersona?.identifier) return
        const granted = await requestPermissionFromExtensionPage(selectedAccount.identifier.network as EnhanceableSite)
        if (!granted) return
        await Service.SiteAdaptor.connectSite(
            currentPersona.identifier,
            selectedAccount.identifier.network,
            selectedAccount.identifier,
        )
        window.close()
    }, [selectedAccount, currentPersona])

    useTitle(_(msg`Social Account`))

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
                                // eslint-disable-next-line react/naming-convention/component-name
                                <MaskSharedTrans.popups_persona_disconnect_tips
                                    components={{
                                        strong: (
                                            <strong
                                                style={{ color: theme.palette.maskColor.main, wordBreak: 'keep-all' }}
                                            />
                                        ),
                                    }}
                                    values={{
                                        identity: selectedAccount?.identifier.userId || '',
                                        personaName: currentPersona.nickname || '',
                                    }}
                                />
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

    useUpdateEffect(() => {
        setPendingUnlistedConfig(unlistedAddressConfig)
    }, [JSON.stringify(unlistedAddressConfig)])

    if (!selectedAccount) return null

    return (
        <AccountDetailUI
            account={selectedAccount}
            onVerify={onVerify}
            isSupportNextDotID={isSupportNextDotID}
            walletProofs={walletProofs}
            toggleUnlisted={toggleUnlisted}
            listingAddresses={listingAddresses}
            loading={isLoading}
            onSubmit={handleSubmit}
            submitting={submitting}
        />
    )
})
Component.displayName = 'AccountDetail'
