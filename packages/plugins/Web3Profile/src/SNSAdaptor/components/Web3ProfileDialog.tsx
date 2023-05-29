import { useCallback, useMemo, useState } from 'react'
import { useAsyncFn, useAsyncRetry, useUpdateEffect } from 'react-use'
import { isEqual, isEqualWith, range, sortBy, uniqBy } from 'lodash-es'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { Icons } from '@masknet/icons'
import { Alert, EmptyStatus, InjectedDialog, PersonaAction, usePersonaProofs } from '@masknet/shared'
import { EMPTY_LIST, NextIDPlatform, PopupRoutes, type MaskEvents, PluginID, EMPTY_OBJECT } from '@masknet/shared-base'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Web3Storage } from '@masknet/web3-providers'
import { hiddenAddressesAdapter, useChainContext, useHiddenAddressConfig } from '@masknet/web3-hooks-base'
import { DialogActions, DialogContent } from '@mui/material'
import { useI18N } from '../../locales/index.js'
import { context } from '../context.js'
import { useAllPersonas, useCurrentPersona, useLastRecognizedProfile } from '../hooks/index.js'
import { ProfileCard, ProfileCardSkeleton } from './ProfileCard.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        width: 568,
        height: 484,
        padding: theme.spacing(1, 2, 0),
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

interface AddressConfig {
    hiddenAddresses: Record<string, string[]>
}

interface Props {
    open: boolean
    onClose(): void
}
export function Web3ProfileDialog({ open, onClose }: Props) {
    const t = useI18N()
    const { classes } = useStyles()
    const { chainId } = useChainContext()
    const myProfile = useLastRecognizedProfile()
    const allPersona = useAllPersonas()

    const [tipsVisible, setTipsVisible] = useState(true)
    const dismissTips = useCallback(() => setTipsVisible(false), [])

    const persona = useCurrentPersona()
    const currentPersona = allPersona.find((x) => x.identifier.rawPublicKey === persona?.rawPublicKey)
    const personaPublicKey = currentPersona?.identifier.publicKeyAsHex
    const allLinkedProfiles = useMemo(() => {
        return allPersona.flatMap((x) => x.linkedProfiles).filter((x) => x.identifier.network === 'twitter.com')
    }, [])

    const {
        data: proofs,
        isLoading: loadingBinding,
        isFetched,
    } = usePersonaProofs(personaPublicKey, {
        events: { ownProofChanged: context?.ownProofChanged },
    } as WebExtensionMessage<MaskEvents>)
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

    const {
        data: unlistedAddressConfig,
        isInitialLoading,
        refetch,
    } = useHiddenAddressConfig(personaPublicKey, PluginID.Web3Profile)
    const migratedUnlistedAddressConfig = useMemo(() => {
        if (!unlistedAddressConfig || !twitterProofs.length) return EMPTY_OBJECT
        if (!Array.isArray(unlistedAddressConfig)) return unlistedAddressConfig

        return hiddenAddressesAdapter(
            unlistedAddressConfig,
            twitterProofs.map((x) => x.identity),
        )
    }, [unlistedAddressConfig, twitterProofs])

    const [pendingUnlistedConfig, setPendingUnlistedConfig] = useState<Record<string, string[]>>({})
    useUpdateEffect(() => {
        setPendingUnlistedConfig(migratedUnlistedAddressConfig)
    }, [migratedUnlistedAddressConfig])
    const isClean = useMemo(() => {
        return isEqualWith(migratedUnlistedAddressConfig, pendingUnlistedConfig, (config1, config2) => {
            for (const key of Object.keys(config1)) {
                if (!isEqual(sortBy(config1[key]), sortBy(config2[key]))) return false
            }
            return true
        })
    }, [migratedUnlistedAddressConfig, pendingUnlistedConfig])

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
        if (!currentPersona?.identifier) return
        const storage = Web3Storage.createNextIDStorage(
            currentPersona?.identifier.publicKeyAsHex,
            NextIDPlatform.NextID,
            currentPersona.identifier,
        )
        try {
            await storage.set<AddressConfig>(PluginID.Web3Profile, {
                hiddenAddresses: pendingUnlistedConfig,
            })
            showSnackbar(t.save_successfully(), {
                variant: 'success',
                message: t.save_successfully_message(),
                autoHideDuration: 2000,
            })
        } catch {
            showSnackbar(t.save_failed(), {
                variant: 'error',
                message: t.save_failed_message(),
            })
        }

        refetch()
    }, [currentPersona?.identifier, pendingUnlistedConfig, t])

    const { value: avatar } = useAsyncRetry(async () => context.getPersonaAvatar(currentPersona?.identifier), [])

    const openPopupsWindow = useCallback(() => {
        context.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }, [chainId])

    const disabled = isClean || isInitialLoading

    return (
        <InjectedDialog
            classes={{ dialogContent: classes.content }}
            title={t.web3_profile()}
            fullWidth={false}
            open={open}
            isOnBack
            titleTail={
                <Icons.WalletUnderTabs size={24} onClick={openPopupsWindow} className={classes.titleTailButton} />
            }
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <Alert open={tipsVisible} onClose={dismissTips}>
                    {t.setup_tips()}
                </Alert>
                {loadingBinding && !twitterProofs.length ? (
                    range(3).map((v) => <ProfileCardSkeleton className={classes.profileCard} key={v} />)
                ) : isFetched && !twitterProofs.length ? (
                    <EmptyStatus>{t.no_verified_account()}</EmptyStatus>
                ) : (
                    twitterProofs.map((proof) => {
                        const avatar = allLinkedProfiles.find((x) => x.identifier.userId === proof.identity)?.avatar
                        const unlistedAddresses = migratedUnlistedAddressConfig[proof.identity] ?? EMPTY_LIST
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
                )}
            </DialogContent>
            {currentPersona ? (
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
                            {t.confirm()}
                        </ActionButton>
                    </PersonaAction>
                </DialogActions>
            ) : null}
        </InjectedDialog>
    )
}
