import React, { useState } from 'react'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback, useModal } from './Base'
import { TextField, makeStyles, createStyles, Button } from '@material-ui/core'
import type { Profile } from '../../../database'
import { Avatar } from '../../../utils/components/Avatar'
import Services from '../../service'
import ActionButton, { DebounceButton } from '../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'
import { useI18N } from '../../../utils/i18n-next-ui'
import { UserMinus, Search } from 'react-feather'

interface ContactProps {
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

export function DashboardContactDeleteConfirmDialog(
    props: WrappedDialogProps<ContactProps & { onDeleted: () => void }>,
) {
    const { contact, onDeleted } = props.ComponentProps!
    const { t } = useI18N()

    // TODO!: delete profile breaks database
    const onDelete = useSnackbarCallback(
        // ! directly destroy parent dialog is NG so close self first
        () => Services.Identity.removeProfile(contact.identifier).then(props.onClose),
        [contact],
        () => {
            props.onClose()
            onDeleted()
        },
    )
    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<UserMinus />}
                iconColor="#F4637D"
                primary={t('delete_contact')}
                secondary={t('delete_contact_confirmation', { contact: contact.nickname ?? contact.identifier.userId })}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton variant="contained" color="danger" onClick={onDelete}>
                            {t('ok')}
                        </DebounceButton>
                        <Button variant="outlined" color="inherit" onClick={props.onClose}>
                            {t('cancel')}
                        </Button>
                    </SpacedButtonGroup>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardContactDialog(props: WrappedDialogProps<ContactProps & { onUpdated: () => void }>) {
    const { t } = useI18N()
    const classes = useStyles()
    const { contact, onUpdated } = props.ComponentProps!
    const [nickname, setNickname] = useState(contact.nickname)
    const [avatarURL, setAvatarURL] = useState(contact.avatar)

    const onSubmit = useSnackbarCallback(
        () => Services.Identity.updateProfileInfo(contact.identifier, { nickname, avatarURL, forceUpdateAvatar: true }),
        [nickname, avatarURL],
        () => {
            props.onClose()
            onUpdated()
        },
    )
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<Avatar className={classes.avatar} person={contact} />}
                primary={contact.nickname || contact.identifier.userId}
                content={
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
                            label={t('new_avatar_url')}
                            placeholder={t('new_avatar_url_placeholder')}
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
                }
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton variant="contained" onClick={onSubmit}>
                            {t('save')}
                        </DebounceButton>
                        <Button variant="outlined" color="inherit" onClick={props.onClose}>
                            {t('cancel')}
                        </Button>
                    </SpacedButtonGroup>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardContactSearchDialog(props: WrappedDialogProps<{ onSearch: (text: string) => void }>) {
    const { t } = useI18N()
    const { onSearch } = props.ComponentProps!
    const [text, setText] = useState('')

    const searchText = () => {
        if (!text) return
        props.onClose()
        onSearch(text)
    }

    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<Search />}
                iconColor="#5FDD97"
                primary={t('search_contact')}
                content={
                    <form>
                        <TextField
                            autoFocus
                            required
                            label={t('keywords')}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    searchText()
                                }
                            }}
                        />
                    </form>
                }
                footer={
                    <SpacedButtonGroup>
                        <ActionButton variant="contained" disabled={!text} onClick={searchText}>
                            {t('search')}
                        </ActionButton>
                    </SpacedButtonGroup>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
