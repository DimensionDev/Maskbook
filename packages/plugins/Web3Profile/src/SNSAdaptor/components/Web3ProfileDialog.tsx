import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { Icons } from '@masknet/icons'
import { InjectedDialog, PersonaAction, usePersonaProofs } from '@masknet/shared'
import { EMPTY_LIST, NextIDPlatform, PopupRoutes, type MaskEvents, PluginID, EMPTY_OBJECT } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { hiddenAddressesAdapter, useChainContext, useHiddenAddressConfig, useWeb3State } from '@masknet/web3-hooks-base'
import { DialogActions, DialogContent } from '@mui/material'
import { isEmpty, isEqual, range, uniqBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import { useI18N } from '../../locales/index.js'
import { context } from '../context.js'
import { useAllPersonas, useCurrentPersona, useLastRecognizedProfile } from '../hooks/index.js'
import { ProfileCard, ProfileCardSkeleton } from './ProfileCard.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        width: 568,
        height: 494,
        padding: '0px 16px',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    profileCard: {
        marginTop: theme.spacing(1.5),
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

    const persona = useCurrentPersona()
    const currentPersona = allPersona.find((x) => x.identifier.rawPublicKey === persona?.rawPublicKey)
    const personaPublicKey = currentPersona?.identifier.publicKeyAsHex
    const allLinkedProfiles = useMemo(() => {
        return allPersona.flatMap((x) => x.linkedProfiles).filter((x) => x.identifier.network === 'twitter.com')
    }, [])

    const { value: proofs, loading: loadingBinding } = usePersonaProofs(personaPublicKey, {
        events: { ownProofChanged: context?.ownProofChanged },
    } as WebExtensionMessage<MaskEvents>)
    const twitterProofs = useMemo(() => {
        if (!proofs?.length) return EMPTY_LIST
        return uniqBy(
            proofs.filter((proof) => proof.platform === NextIDPlatform.Twitter),
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
    useEffect(() => {
        setPendingUnlistedConfig((config) => (isEmpty(config) ? migratedUnlistedAddressConfig : config))
    }, [migratedUnlistedAddressConfig])
    const isClean = isEqual(migratedUnlistedAddressConfig, pendingUnlistedConfig)

    const toggleUnlisted = useCallback((identity: string, address: string) => {
        setPendingUnlistedConfig((config) => {
            const list = config[identity] ?? []
            return {
                ...config,
                [identity]: list.includes(address) ? list.filter((x) => x !== address) : [...list, address],
            }
        })
    }, [])

    const { Storage } = useWeb3State()
    const [{ loading: submitting }, handleSubmit] = useAsyncFn(async () => {
        if (!Storage || !currentPersona?.identifier) return
        const storage = Storage.createNextIDStorage(
            currentPersona?.identifier.publicKeyAsHex,
            NextIDPlatform.NextID,
            currentPersona.identifier,
        )
        await storage.set<AddressConfig>(PluginID.Web3Profile, {
            hiddenAddresses: pendingUnlistedConfig,
        })
        refetch()
    }, [Storage, currentPersona?.identifier, pendingUnlistedConfig])

    const { value: avatar } = useAsyncRetry(async () => context.getPersonaAvatar(currentPersona?.identifier), [])

    const openPopupsWindow = () => {
        context.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }

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
                {loadingBinding && !twitterProofs.length
                    ? range(3).map((v) => <ProfileCardSkeleton className={classes.profileCard} key={v} />)
                    : twitterProofs.map((proof, i) => {
                          const avatar = allLinkedProfiles.find((x) => x.identifier.userId === proof.identity)?.avatar
                          const unlistedAddresses = migratedUnlistedAddressConfig[proof.identity] ?? EMPTY_LIST
                          const pendingUnlistedAddresses = pendingUnlistedConfig[proof.identity] ?? EMPTY_LIST
                          return (
                              <ProfileCard
                                  key={proof.identity}
                                  className={classes.profileCard}
                                  avatar={avatar}
                                  profile={proof}
                                  walletProofs={walletProofs}
                                  unlistedAddresses={unlistedAddresses}
                                  pendingUnlistedAddresses={pendingUnlistedAddresses}
                                  initialCollapsed={i !== 0}
                                  onToggle={toggleUnlisted}
                              />
                          )
                      })}
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
