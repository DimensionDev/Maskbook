import React, { useState } from 'react'
import { DialogContentItem } from './DialogBase'

import { TextField, Typography, makeStyles, createStyles, Dialog } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'

import ActionButton from '../DashboardComponents/ActionButton'

import classNames from 'classnames'
import { useColorProvider } from '../../../utils/theme'
import { ProfileIdentifier } from '../../../database/type'
import Services from '../../service'
import { getNetworkWorker } from '../../../social-network/worker'

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
                title="Setup Successful"
                content={`You have seccessfully connected @${identifier.userId} on ${identifier.network} to persona "${nickname}".`}
                actions={
                    <ActionButton variant="outlined" color="default" onClick={onClose}>
                        Ok
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
                title="Setup Failure"
                content={`The profile bio should include "${provePost}". Please make sure you updated the profile bio of @${userId} successfully.`}
                actions={
                    <ActionButton variant="outlined" color="default" onClick={onClose}>
                        Ok
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
                label={`Username on ${network}`}></TextField>
        </div>
    )

    return (
        <DialogContentItem
            onExit={onDecline}
            title={`Connect Profile for "${nickname}"`}
            content={content}
            actionsAlign="center"
            actions={
                <ActionButton variant="contained" color="primary" onClick={() => onConfirm(name)}>
                    Next
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
                <Typography variant="h6">Step 1: Copy the public key below</Typography>
                <Typography variant="body2">{provePost}</Typography>
                <ActionButton onClick={copyPublicKey} className={classes.button} variant="outlined" color="primary">
                    Copy
                </ActionButton>
            </section>
            <section>
                <Typography variant="h6">Step 2: Paste it into your profile biography</Typography>
                <Typography variant="body2">Hand-by-hand guides will show up after you move to the webpage.</Typography>
                <ActionButton
                    onClick={navToProvider}
                    className={classNames(classes.button, classes.buttonLarge)}
                    variant="outlined"
                    color="primary">
                    Go to {identifier.network}
                </ActionButton>
            </section>
            <section>
                <Typography variant="h6">Step 3: Test and finish</Typography>
                <Typography variant="body2">
                    Come back here and finish the procedure. Test if your setup is successful.
                </Typography>
                <ActionButton
                    onClick={testIfSet}
                    className={classNames(classes.button, classes.buttonLarge)}
                    variant="contained"
                    color="primary"
                    loading={state === 'loading'}>
                    Test
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

    return <DialogContentItem onExit={onClose} title="Connect Profile" content={content}></DialogContentItem>
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
            title="Disconnect Profile"
            content={`Do you really want to disconnect @${identifier.userId} on ${identifier.network} from persona "${nickname}"? This operation cannot be reverted.`}
            actions={
                <>
                    <ActionButton variant="outlined" color="default" onClick={onDecline}>
                        Cancel
                    </ActionButton>
                    <ActionButton classes={{ root: color.errorButton }} onClick={deletePersona}>
                        Ok
                    </ActionButton>
                </>
            }></DialogContentItem>
    )
}
