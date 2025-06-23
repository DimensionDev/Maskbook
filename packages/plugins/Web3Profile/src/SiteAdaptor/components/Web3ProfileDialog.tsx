import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { openPopupWindow, queryPersonaAvatar } from '@masknet/plugin-infra/dom/context'
import { Alert, EmptyStatus, InjectedDialog, PersonaAction, PopupHomeTabType, usePersonaProofs } from '@masknet/shared'
import { EMPTY_LIST, NextIDPlatform, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { DialogActions, DialogContent } from '@mui/material'
import { range, uniqBy } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useAllPersonas, useCurrentPersona, useLastRecognizedProfile } from '../hooks/index.js'
import { ProfileCard, ProfileCardSkeleton } from './ProfileCard.js'

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

    const { value: avatar } = useAsyncRetry(async () => queryPersonaAvatar(currentPersona?.identifier), [])

    const openPopupsWindow = useCallback(() => {
        openPopupWindow(PopupRoutes.Personas, {
            tab: PopupHomeTabType.ConnectedWallets,
        })
    }, [])

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
                        const isCurrent = proof.identity.toLowerCase() === myProfile?.identifier?.userId.toLowerCase()
                        return (
                            <ProfileCard
                                key={proof.identity}
                                className={classes.profileCard}
                                avatar={avatar}
                                profile={proof}
                                walletProofs={walletProofs}
                                initialExpanded={isCurrent}
                                isCurrent={isCurrent}
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
                        <ActionButton className={classes.button} onClick={onClose}>
                            <Trans>Confirm</Trans>
                        </ActionButton>
                    </PersonaAction>
                </DialogActions>
            :   null}
        </InjectedDialog>
    )
})
