import { Button, TextField } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useSnackbarCallback } from '@masknet/shared'
import { useState } from 'react'
import { Avatar, useI18N } from '../../../../utils'
import Services from '../../../service'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../../DashboardComponents/SpacedButtonGroup'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import type { ContactProps } from './types'

const useStyles = makeStyles()({
    avatar: {
        width: '64px',
        height: '64px',
    },
})

export function DashboardContactDialog(
    props: WrappedDialogProps<
        ContactProps & {
            onUpdated: () => void
        }
    >,
) {
    const { t } = useI18N()
    const { classes } = useStyles()
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
                        <TextField label={t('internal_id')} value={contact.identifier.toText()} disabled />
                        <TextField
                            label={t('nickname')}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                        <TextField
                            label={t('new_avatar_url')}
                            placeholder={t('new_avatar_url_placeholder')}
                            value={avatarURL}
                            onChange={(e) => setAvatarURL(e.target.value)}
                        />
                        <TextField
                            label={t('fingerprint')}
                            defaultValue={contact.linkedPersona?.fingerprint}
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
                }
            />
        </DashboardDialogCore>
    )
}
