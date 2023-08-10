import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAsyncFn, useUnmount } from 'react-use'
import { useNavigate } from 'react-router-dom'
import {
    type EnhanceableSite,
    PopupRoutes,
    SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID,
    PluginID,
    EMPTY_LIST,
    EMPTY_OBJECT,
    NextIDAction,
    SignType,
} from '@masknet/shared-base'
import { PersonaContext } from '@masknet/shared'
import { usePopupCustomSnackbar } from '@masknet/theme'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/index.js'
import { AccountDetailUI } from './UI.js'
import Service from '../../../../service.js'
import { PageTitleContext } from '../../../context.js'
import { Icons } from '@masknet/icons'
import { useUnlistedAddressConfig } from '@masknet/web3-hooks-base'
import { useUpdateEffect } from '@react-hookz/web'
import { isEqualWith, uniq, sortBy, isEqual } from 'lodash-es'
import { DisconnectModal } from '../../../modals/modals.js'
import { NextIDProof } from '@masknet/web3-providers'
import { Trans } from 'react-i18next'
import { useTheme } from '@mui/material'

const AccountDetail = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const theme = useTheme()
    const { selectedAccount, currentPersona, walletProofs } = PersonaContext.useContainer()
    const { setExtension } = useContext(PageTitleContext)

    const [pendingUnlistedConfig, setPendingUnlistedConfig] = useState<Record<string, string[]>>({})

    const { showSnackbar } = usePopupCustomSnackbar()

    const isSupportNextDotID = selectedAccount
        ? SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID.includes(selectedAccount.identifier.network as EnhanceableSite)
        : false

    const [{ data: unlistedAddressConfig = EMPTY_OBJECT, isInitialLoading, refetch }, updateConfig] =
        useUnlistedAddressConfig({
            identifier: currentPersona?.identifier,
            pluginID: PluginID.Web3Profile,
            socialIds:
                isSupportNextDotID && selectedAccount?.is_valid && selectedAccount.identity
                    ? [selectedAccount.identity]
                    : EMPTY_LIST,
        })

    const isClean = useMemo(() => {
        if (!selectedAccount?.is_valid) return true

        return isEqualWith(unlistedAddressConfig, pendingUnlistedConfig, (config1, config2) => {
            // Some identities might only in pendingUnlistedConfig but not in migratedUnlistedAddressConfig,
            // so we merged all the identities
            const keys = uniq([...Object.keys(config1), ...Object.keys(config2)])
            for (const key of keys) {
                if (!isEqual(sortBy(config1[key] || []), sortBy(config2[key] || []))) return false
            }
            return true
        })
    }, [unlistedAddressConfig, pendingUnlistedConfig, selectedAccount])

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

    const handleDetachProfile = useCallback(async () => {
        try {
            if (!selectedAccount?.identifier) return
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

    const [{ loading: submitting }, handleSubmit] = useAsyncFn(async () => {
        try {
            await updateConfig(pendingUnlistedConfig)
            showSnackbar(t('popups_save_successfully'), {
                variant: 'success',
                autoHideDuration: 2000,
            })
        } catch {
            showSnackbar(t('popups_save_failed'), {
                variant: 'error',
            })
        }

        refetch()
    }, [pendingUnlistedConfig, t, updateConfig])

    const handleConfirmReleaseBind = useCallback(async () => {
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
        await Service.SiteAdaptor.connectSite(
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
        setExtension(
            !selectedAccount?.is_valid ? (
                <Icons.Trash size={24} onClick={handleDetachProfile} />
            ) : (
                <Icons.Disconnect
                    size={24}
                    onClick={async () => {
                        if (!currentPersona) return
                        const confirmed = await DisconnectModal.openAndWaitForClose({
                            title: t('popups_disconnect_persona'),
                            tips: (
                                <Trans
                                    i18nKey="popups_persona_disconnect_tips"
                                    components={{ strong: <strong style={{ color: theme.palette.maskColor.main }} /> }}
                                    values={{
                                        identity: selectedAccount.identifier.userId,
                                        personaName: currentPersona?.nickname,
                                    }}
                                />
                            ),
                        })
                        if (confirmed) await handleConfirmReleaseBind()
                    }}
                />
            ),
        )
    }, [selectedAccount, handleDetachProfile, currentPersona, handleConfirmReleaseBind])

    useUnmount(() => {
        setExtension(null)
    })

    useUpdateEffect(() => {
        setPendingUnlistedConfig(unlistedAddressConfig)
    }, [JSON.stringify(unlistedAddressConfig)])

    if (!selectedAccount) return null

    return (
        <>
            <AccountDetailUI
                account={selectedAccount}
                onVerify={onVerify}
                isSupportNextDotID={isSupportNextDotID}
                walletProofs={walletProofs}
                isClean={isClean}
                toggleUnlisted={toggleUnlisted}
                listingAddresses={listingAddresses}
                loading={isInitialLoading}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </>
    )
})

export default AccountDetail
