import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { openPopupWindow, queryPersonaAvatar } from '@masknet/plugin-infra/dom/context'
import { InjectedDialog, PersonaAction, PopupHomeTabType } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Avatar, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { useAllPersonas, useCurrentPersona, useLastRecognizedProfile } from '../hooks/index.js'

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
    actions: {
        padding: '0px !important',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    button: {
        width: 276,
    },
    titleTailButton: {
        cursor: 'pointer',
        color: theme.vars.palette.maskColor.main,
    },
    profileItem: {
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
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

    const persona = useCurrentPersona()
    const currentPersona = allPersona.find((x) => x.identifier.rawPublicKey === persona?.rawPublicKey)
    const twitterProfiles = useMemo(() => {
        return allPersona.flatMap((x) => x.linkedProfiles).filter((x) => x.identifier.network === 'twitter.com')
    }, [allPersona])

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
                <Stack>
                    {twitterProfiles.map((profile) => (
                        <div key={profile.identifier.toText()} className={classes.profileItem}>
                            <Avatar src={profile.avatar} />
                            <div>
                                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                                    @{profile.identifier.userId}
                                </Typography>
                                {profile.nickname ?
                                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                        {profile.nickname}
                                    </Typography>
                                :   null}
                            </div>
                        </div>
                    ))}
                </Stack>
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
