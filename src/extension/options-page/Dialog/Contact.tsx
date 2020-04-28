import React, { useState } from 'react'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import { TextField, makeStyles, createStyles } from '@material-ui/core'
import type { Profile } from '../../../database'
import { Avatar } from '../../../utils/components/Avatar'
import Services from '../../service'
import { ThrottledButton } from '../DashboardComponents/ActionButton'

interface ContactDialogProps {
    contact: Profile
}

const useStyles = makeStyles((theme) =>
    createStyles({
        avatar: {
            width: '64px',
            height: '64px',
        },
    }),
)

export function DashboardContactDialog(props: WrappedDialogProps<ContactDialogProps>) {
    const { contact } = props.ComponentProps!

    const [nickname, setNickname] = useState(contact.nickname)
    const [avatarURL, setAvatarURL] = useState(contact.avatar)

    const classes = useStyles()

    const onSubmit = useSnackbarCallback(
        () => Services.Identity.updateProfileInfo(contact.identifier, { nickname, avatarURL, forceUpdateAvatar: true }),
        [nickname, avatarURL],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<Avatar className={classes.avatar} person={contact} />}
                primary={contact.nickname || '<Unnamed>'}>
                <form>
                    <TextField label="Internal ID" value={contact.identifier.toText()} variant="outlined" disabled />
                    <TextField
                        label="Nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        variant="outlined"
                    />
                    <TextField
                        label="New Avatar URL"
                        value={avatarURL}
                        onChange={(e) => setAvatarURL(e.target.value)}
                        variant="outlined"
                    />
                    <TextField
                        label="Fingerprint"
                        defaultValue={contact.linkedPersona?.fingerprint}
                        variant="outlined"
                        disabled
                    />
                </form>
                <ThrottledButton variant="contained" color="primary" onClick={onSubmit}>
                    Submit
                </ThrottledButton>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
