import { isEqual, isEqualWith, range, sortBy, uniq, uniqBy } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import { DialogActions, DialogContent } from '@mui/material'
import { Icons } from '@masknet/icons'
import { Alert, EmptyStatus, InjectedDialog, PersonaAction, PopupHomeTabType, usePersonaProofs } from '@masknet/shared'
import { EMPTY_LIST, NextIDPlatform, PopupRoutes, PluginID, EMPTY_OBJECT } from '@masknet/shared-base'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useUnlistedAddressConfig } from '@masknet/web3-hooks-base'
import { openPopupWindow, queryPersonaAvatar, signWithPersona } from '@masknet/plugin-infra/dom/context'
import { useAllPersonas, useCurrentPersona, useLastRecognizedProfile } from '../hooks/index.js'
import { ProfileCard, ProfileCardSkeleton } from './ProfileCard.js'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    content: {
        width: 568,
        height: 484,
        padding: theme.spacing(1, 2, 0),
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    profileCard: {
        margin: theme.spacing(1.5, 0),
    },
    actions: {
        padding: '0px !important',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    button: {
        width: 276,
    },
    titleTailButton: {
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
}))

interface Props {
    open: boolean
    onClose(): void
}
export const Web3ProfileDialog = memo(function Web3ProfileDialog({ open, onClose }: Props) {
    const { classes } = useStyles()
    const myProfile = useLastRecognizedProfile()
    const allPersona = useAllPersonas()

    const [tipsVisible, setTipsVisible] = useState(true)
    const dismissTips = useCallback(() => setTipsVisible(false), [])

    const persona = useCurrentPersona()
    const currentPersona = allPersona.find((x) => x.identifier.rawPublicKey === persona?.rawPublicKey)
    const personaPublicKey = currentPersona?.identifier.publicKeyAsHex
    const allLinkedProfiles = useMemo(() => {
        return allPersona.flatMap((x) => x.linkedProfiles).filter((x) => x.identifier.network === 'twitter.com')
    }, [allPersona])

    const { data: proofs, isPending: loadingBinding, isFetched } = usePersonaProofs(personaPublicKey)

    const twitterProofs = useMemo(() => {
        if (!proofs?.length) return EMPTY_LIST
        return uniqBy(
            proofs.filter((proof) => proof.platform === NextIDPlatform.Twitter && proof.is_valid),
            (x) => x.identity,
        )
    }, [proofs])
    const walletProofs = useMemo(() => {
        if (!proofs?.length) return EMPTY_LIST
        return uniqBy(
            proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum),
            (x) => x.identity,
        )
    }, [proofs])

    const socialIds = useMemo(() => twitterProofs.map((x) => x.identity), [twitterProofs])
    const [{ data: unlistedAddressConfig = EMPTY_OBJECT, isLoading, refetch }, updateConfig] = useUnlistedAddressConfig(
        {
            identifier: currentPersona?.identifier,
            pluginID: PluginID.Web3Profile,
            socialIds,
        },
        signWithPersona,
    )

    const [pendingUnlistedConfig, setPendingUnlistedConfig] = useState<Record<string, string[]>>({})
    useRenderPhraseCallbackOnDepsChange(() => {
        setPendingUnlistedConfig(unlistedAddressConfig)
    }, [unlistedAddressConfig])
    const isClean = useMemo(() => {
        return isEqualWith(unlistedAddressConfig, pendingUnlistedConfig, (config1, config2) => {
            // Some identities might only in pendingUnlistedConfig but not in migratedUnlistedAddressConfig,
            // so we merged all the identities
            const keys = uniq([...Object.keys(config1), ...Object.keys(config2)])
            for (const key of keys) {
                if (!isEqual(sortBy(config1[key] || []), sortBy(config2[key] || []))) return false
            }
            return true
        })
    }, [unlistedAddressConfig, pendingUnlistedConfig])

    const toggleUnlisted = useCallback((identity: string, address: string) => {
        setPendingUnlistedConfig((config) => {
            const list = config[identity] ?? []
            return {
                ...config,
                [identity]: list.includes(address) ? list.filter((x) => x !== address) : [...list, address],
            }
        })
    }, [])

    const { showSnackbar } = useCustomSnackbar()
    const [{ loading: submitting }, handleSubmit] = useAsyncFn(async () => {
        try {
            await updateConfig(pendingUnlistedConfig)
            showSnackbar(<Trans>Save successfully</Trans>, {
                variant: 'success',
                message: <Trans>Set up Web3 Profile wallets successfully.</Trans>,
                autoHideDuration: 2000,
            })
        } catch {
            showSnackbar(<Trans>Save failed</Trans>, {
                variant: 'error',
                message: <Trans>Failed to set up Web3 Profile wallets. Please try again.</Trans>,
            })
        }

        refetch()
    }, [pendingUnlistedConfig, updateConfig])

    const { value: avatar } = useAsyncRetry(async () => queryPersonaAvatar(currentPersona?.identifier), [])

    const openPopupsWindow = useCallback(() => {
        openPopupWindow(PopupRoutes.Personas, {
            tab: PopupHomeTabType.ConnectedWallets,
        })
    }, [])

    const disabled = isClean || isLoading

    return (
        <InjectedDialog
            classes={{ dialogContent: classes.content }}
            title={<Trans>Web3 Profile</Trans>}
            fullWidth={false}
            open={open}
            isOnBack
            titleTail={<Icons.Wallet size={24} onClick={openPopupsWindow} className={classes.titleTailButton} />}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <Alert open={tipsVisible} onClose={dismissTips}>
                    <Trans>
                        Set up wallet for displaying Web3 footprints and receiving tips on each social media account.
                    </Trans>
                </Alert>
                {loadingBinding && !twitterProofs.length ?
                    range(3).map((v) => <ProfileCardSkeleton className={classes.profileCard} key={v} />)
                : isFetched && !twitterProofs.length ?
                    <EmptyStatus height={360}>
                        <Trans>No verified account found here.</Trans>
                    </EmptyStatus>
                :   twitterProofs.map((proof) => {
                        const avatar = allLinkedProfiles.find((x) => x.identifier.userId === proof.identity)?.avatar
                        const unlistedAddresses = unlistedAddressConfig[proof.identity] ?? EMPTY_LIST
                        const pendingUnlistedAddresses = pendingUnlistedConfig[proof.identity] ?? EMPTY_LIST
                        const isCurrent = proof.identity.toLowerCase() === myProfile?.identifier?.userId.toLowerCase()
                        return (
                            <ProfileCard
                                key={proof.identity}
                                className={classes.profileCard}
                                avatar={avatar}
                                profile={proof}
                                walletProofs={walletProofs}
                                unlistedAddresses={unlistedAddresses}
                                pendingUnlistedAddresses={pendingUnlistedAddresses}
                                initialExpanded={isCurrent}
                                isCurrent={isCurrent}
                                onToggle={toggleUnlisted}
                                onAddWallet={openPopupsWindow}
                            />
                        )
                    })
                }
            </DialogContent>
            {currentPersona ?
                <DialogActions className={classes.actions}>
                    <PersonaAction
                        avatar={avatar === null ? undefined : avatar}
                        currentPersona={currentPersona}
                        currentVisitingProfile={myProfile}>
                        <ActionButton
                            className={classes.button}
                            disabled={disabled}
                            loading={submitting}
                            onClick={handleSubmit}>
                            <Trans>Confirm</Trans>
                        </ActionButton>
                    </PersonaAction>
                </DialogActions>
            :   null}
        </InjectedDialog>
    )
})
