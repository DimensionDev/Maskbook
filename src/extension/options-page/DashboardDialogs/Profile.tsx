import React, { useState } from 'react'
import { DialogContentItem } from './DialogBase'

import { TextField, Typography, makeStyles, createStyles, Dialog } from '@material-ui/core'

import ActionButton from '../DashboardComponents/ActionButton'

import classNames from 'classnames'
import { useColorProvider } from '../../../utils/theme'
import { ProfileIdentifier } from '../../../database/type'
import Services from '../../service'
import { getNetworkWorker } from '../../../social-network/worker'
import { geti18nString } from '../../../utils/i18n'

const useStyles = makeStyles(theme =>
    createStyles({
        button: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            width: 140,
        },
        buttonLarge: {
            width: 240,
        },
    }),
)

interface ProfileConnectTestSuccessDialogProps {
    identifier: ProfileIdentifier
    nickname: string
    onClose: () => void
}

function ProfileConnectTestSuccessDialog(props: ProfileConnectTestSuccessDialogProps) {
    const { identifier, nickname, onClose } = props
    return (
        <Dialog open onClose={onClose}>
            <DialogContentItem
                simplified
                title={geti18nString('setup_successful')}
                content={geti18nString('dashboard_bio_test_succeeful', [
                    identifier.userId,
                    identifier.network,
                    nickname,
                ])}
                actions={
                    <ActionButton variant="outlined" color="default" onClick={onClose}>
                        {geti18nString('ok')}
                    </ActionButton>
                }></DialogContentItem>
        </Dialog>
    )
}

interface ProfileConnectTestFailedDialog {
    provePost: string
    userId: string
    onClose: () => void
}

function ProfileConnectTestFailedDialog(props: ProfileConnectTestFailedDialog) {
    const { provePost, userId, onClose } = props
    return (
        <Dialog open onClose={onClose}>
            <DialogContentItem
                simplified
                title={geti18nString('setup_failure')}
                content={geti18nString('dashboard_bio_test_failed', [provePost, userId])}
                actions={
                    <ActionButton variant="outlined" color="default" onClick={onClose}>
                        {geti18nString('ok')}
                    </ActionButton>
                }></DialogContentItem>
        </Dialog>
    )
}

interface ProfileConnectStartDialogProps {
    nickname?: string
    network?: string
    onConfirm(name: string): void
    onDecline(): void
}

export function ProfileConnectStartDialog(props: ProfileConnectStartDialogProps) {
    const { nickname, network, onConfirm, onDecline } = props
    const [name, setName] = useState('')

    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <TextField
                style={{ width: '100%', maxWidth: '320px' }}
                autoFocus
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                label={geti18nString('dashboard_username_on', network)}></TextField>
        </div>
    )

    return (
        <DialogContentItem
            onExit={onDecline}
            title={geti18nString('dashboard_connect_profile_for', nickname)}
            content={content}
            actionsAlign="center"
            actions={
                <ActionButton variant="contained" color="primary" onClick={() => onConfirm(name)}>
                    {geti18nString('next')}
                </ActionButton>
            }></DialogContentItem>
    )
}

interface ProfileConnectDialogProps {
    identifier: ProfileIdentifier
    nickname: string
    onClose(): void
}

export function ProfileConnectDialog(props: ProfileConnectDialogProps) {
    const { identifier, nickname, onClose } = props
    const [state, setState] = useState('' as '' | 'loading' | 'success' | 'failed')
    const classes = useStyles()

    const [provePost, setProvePost] = React.useState<string | null>(null)
    React.useEffect(() => void Services.Crypto.getMyProveBio(identifier).then(setProvePost), [identifier])

    const copyPublicKey = () => {
        if (provePost) navigator.clipboard.writeText(provePost).then()
    }

    const navToProvider = () => {
        if (provePost) getNetworkWorker(identifier).autoVerifyBio?.(identifier, provePost)
    }

    const testIfSet = async () => {
        if (!provePost) return
        setState('loading')
        const profile = await getNetworkWorker(identifier)
            .fetchProfile(identifier)
            .then(p => p.bioContent)
            .catch(e => {
                console.error(e)
                return ''
            })
        if (profile.includes(provePost)) setState('success')
        else {
            setState('failed')
            console.warn('[debug] We got', profile)
        }
    }

    const content = (
        <>
            <section>
                <Typography variant="h6">{geti18nString('dashboard_attach_profile_step1')}</Typography>
                <Typography variant="body2">{provePost}</Typography>
                <ActionButton onClick={copyPublicKey} className={classes.button} variant="outlined" color="primary">
                    {geti18nString('copy')}
                </ActionButton>
            </section>
            <section>
                <Typography variant="h6">{geti18nString('dashboard_attach_profile_step2')}</Typography>
                <Typography variant="body2">{geti18nString('dashboard_attach_profile_step2_hint')}</Typography>
                <ActionButton
                    onClick={navToProvider}
                    className={classNames(classes.button, classes.buttonLarge)}
                    variant="outlined"
                    color="primary">
                    {geti18nString('go_to')} {identifier.network}
                </ActionButton>
            </section>
            <section>
                <Typography variant="h6">{geti18nString('dashboard_attach_profile_step3')}</Typography>
                <Typography variant="body2">{geti18nString('dashboard_attach_profile_step3_hint')}</Typography>
                <ActionButton
                    onClick={testIfSet}
                    className={classNames(classes.button, classes.buttonLarge)}
                    variant="contained"
                    color="primary"
                    loading={state === 'loading'}>
                    {geti18nString('test')}
                </ActionButton>
            </section>
            {state === 'failed' && (
                <ProfileConnectTestFailedDialog
                    userId={identifier.userId}
                    provePost={provePost!}
                    onClose={() => setState('')}
                />
            )}
            {state === 'success' && (
                <ProfileConnectTestSuccessDialog identifier={identifier} nickname={nickname} onClose={onClose} />
            )}
        </>
    )

    return (
        <DialogContentItem
            onExit={onClose}
            title={geti18nString('connect_profile')}
            content={content}></DialogContentItem>
    )
}
interface ProfileDisconnectDialogProps {
    onDecline(): void
    onConfirm(): void
    nickname?: string
    identifier: ProfileIdentifier
}
export function ProfileDisconnectDialog(props: ProfileDisconnectDialogProps) {
    const { onDecline, onConfirm, nickname, identifier } = props
    const color = useColorProvider()

    const deletePersona = () => {
        Services.Identity.detachProfile(identifier).then(onConfirm)
    }

    return (
        <DialogContentItem
            onExit={onDecline}
            simplified
            title={geti18nString('disconnect_profile')}
            content={geti18nString('dashboard_disconnect_profile_hint', [
                identifier.userId,
                identifier.network,
                nickname!,
            ])}
            actions={
                <>
                    <ActionButton variant="outlined" color="default" onClick={onDecline}>
                        {geti18nString('cancel')}
                    </ActionButton>
                    <ActionButton classes={{ root: color.errorButton }} onClick={deletePersona}>
                        {geti18nString('ok')}
                    </ActionButton>
                </>
            }></DialogContentItem>
    )
}
