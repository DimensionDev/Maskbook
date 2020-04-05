import React, { useState } from 'react'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback, useModal } from './Base'
import { TextField, makeStyles, createStyles } from '@material-ui/core'
import type { Profile } from '../../../database'
import { Avatar } from '../../../utils/components/Avatar'
import Services from '../../service'
import { DebounceButton } from '../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'
import { useI18N } from '../../../utils/i18n-next-ui'
import { UserMinus } from 'react-feather'

interface ContactProps {
    contact: Profile
}

interface ContactDeleteProps extends ContactProps {
    onDeleted(): void
}

const useStyles = makeStyles((theme) =>
    createStyles({
        avatar: {
            width: '64px',
            height: '64px',
        },
    }),
)

export function DashboardContactDeleteConfirmDialog(props: WrappedDialogProps<ContactDeleteProps>) {
    const { contact, onDeleted } = props.ComponentProps!
    const { t } = useI18N()

    // TODO!: delete profile breaks database
    const onDelete = useSnackbarCallback(
        // ! directly destroy parent dialog is NG so close self first
        () => Services.Identity.removeProfile(contact.identifier).then(props.onClose),
        [contact],
        onDeleted,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<UserMinus />}
                iconColor="#F4637D"
                primary={t('delete_contact')}
                secondary={t('delete_contact_confirmation')}>
                <SpacedButtonGroup>
                    <DebounceButton variant="contained" color="danger" onClick={onDelete}>
                        {t('ok')}
                    </DebounceButton>
                    <DebounceButton variant="outlined" color="primary" onClick={props.onClose}>
                        {t('cancel')}
                    </DebounceButton>
                </SpacedButtonGroup>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardContactDialog(props: WrappedDialogProps<ContactProps>) {
    const { contact } = props.ComponentProps!
    const { t } = useI18N()

    const [nickname, setNickname] = useState(contact.nickname)
    const [avatarURL, setAvatarURL] = useState(contact.avatar)

    const classes = useStyles()

    const onSubmit = useSnackbarCallback(
        () => Services.Identity.updateProfileInfo(contact.identifier, { nickname, avatarURL, forceUpdateAvatar: true }),
        [nickname, avatarURL],
        props.onClose,
    )

    const [deleteContact, openDeleteContact] = useModal(DashboardContactDeleteConfirmDialog, {
        contact,
        onDeleted: props.onClose,
    })

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<Avatar className={classes.avatar} person={contact} />}
                primary={contact.nickname || '<Unnamed>'}>
                <form>
                    <TextField
                        label={t('internal_id')}
                        value={contact.identifier.toText()}
                        variant="outlined"
                        disabled
                    />
                    <TextField
                        label={t('nickname')}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        variant="outlined"
                    />
                    <TextField
                        label={t('avatar_url')}
                        value={avatarURL}
                        onChange={(e) => setAvatarURL(e.target.value)}
                        variant="outlined"
                    />
                    <TextField
                        label={t('fingerprint')}
                        defaultValue={contact.linkedPersona?.fingerprint}
                        variant="outlined"
                        disabled
                    />
                </form>
                <SpacedButtonGroup>
                    <DebounceButton variant="contained" color="primary" onClick={onSubmit}>
                        {t('save')}
                    </DebounceButton>
                    <DebounceButton variant="outlined" color="danger" onClick={openDeleteContact}>
                        {t('delete')}
                    </DebounceButton>
                </SpacedButtonGroup>
                {deleteContact}
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
