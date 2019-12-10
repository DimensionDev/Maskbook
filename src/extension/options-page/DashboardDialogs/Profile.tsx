import React, { useState } from 'react'
import { DialogContentItem } from './DialogBase'

import { TextField, Typography, makeStyles, createStyles, Dialog } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'

import ActionButton from '../../../components/Dashboard/ActionButton'

import classNames from 'classnames'
import { useColorProvider } from '../../../utils/theme'
import { ProfileIdentifier } from '../../../database/type'
import Services from '../../service'

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
    id: string
    network: string
    persona: string
    onClose: () => void
}

function ProfileConnectTestSuccessDialog(props: ProfileConnectTestSuccessDialogProps) {
    const { id, network, persona, onClose } = props
    return (
        <Dialog open onClose={onClose}>
            <DialogContentItem
                simplified
                title="Setup Successful"
                content={`You have seccessfully connected ${id} on ${network} to persona "${persona}".`}
                actions={
                    <ActionButton variant="outlined" color="default" onClick={onClose}>
                        Ok
                    </ActionButton>
                }></DialogContentItem>
        </Dialog>
    )
}

interface ProfileConnectTestFailedDialog {
    bio: string
    persona: string
    onClose: () => void
}

function ProfileConnectTestFailedDialog(props: ProfileConnectTestFailedDialog) {
    const { bio, persona, onClose } = props
    return (
        <Dialog open onClose={onClose}>
            <DialogContentItem
                simplified
                title="Setup Failure"
                content={`The profile bio seems to be "${bio}"; it does not include public key of "${persona}".`}
                actions={
                    <ActionButton variant="outlined" color="default" onClick={onClose}>
                        Ok
                    </ActionButton>
                }></DialogContentItem>
        </Dialog>
    )
}

export function ProfileConnectStartDialog() {
    const [name, setName] = useState('')

    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <TextField
                style={{ width: '100%', maxWidth: '320px' }}
                autoFocus
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                label="Name"></TextField>
        </div>
    )

    return (
        <DialogContentItem
            title="Create Persona"
            content={content}
            actionsAlign="center"
            actions={
                <ActionButton variant="contained" color="primary" component={Link} to={`connect?name=${name}`}>
                    Ok
                </ActionButton>
            }></DialogContentItem>
    )
}

export function ProfileConnectDialog() {
    const [state, setState] = useState('' as '' | 'success' | 'failed')
    const classes = useStyles()
    const history = useHistory()

    const content = (
        <>
            <section>
                <Typography variant="h6">Step 1: Copy the public key below</Typography>
                <Typography variant="body2">🔒45e56041ddd9491e91643dabd067cefe🔒</Typography>
                <ActionButton className={classes.button} variant="outlined" color="primary">
                    Copy
                </ActionButton>
            </section>
            <section>
                <Typography variant="h6">Step 2: Paste it into your profile biography</Typography>
                <Typography variant="body2">Hand-by-hand guides will show up after you move to the webpage.</Typography>
                <ActionButton
                    className={classNames(classes.button, classes.buttonLarge)}
                    variant="outlined"
                    color="primary">
                    Go to twitter.com
                </ActionButton>
            </section>
            <section>
                <Typography variant="h6">Step 3: Test and finish</Typography>
                <Typography variant="body2">
                    Come back here and finish the procedure. Test if your setup is successful.
                </Typography>
                <ActionButton
                    onClick={() => setState('success')}
                    className={classNames(classes.button, classes.buttonLarge)}
                    variant="contained"
                    color="primary">
                    Test
                </ActionButton>
            </section>
            {state === 'failed' && (
                <ProfileConnectTestFailedDialog bio="Bio" persona="Persona" onClose={() => setState('')} />
            )}
            {state === 'success' && (
                <ProfileConnectTestSuccessDialog
                    id="userId"
                    network="Network"
                    persona="Persona"
                    onClose={() => history.push('../')}
                />
            )}
        </>
    )

    return <DialogContentItem title="Create Persona" content={content} actionsAlign="center"></DialogContentItem>
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
