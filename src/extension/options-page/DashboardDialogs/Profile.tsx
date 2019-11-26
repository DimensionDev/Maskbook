import React, { useState } from 'react'
import { DialogContentItem } from './DialogBase'

import { Button, TextField, Typography, makeStyles, createStyles, Dialog } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'

import classNames from 'classnames'

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
                    <Button className="actionButton" variant="outlined" color="default" onClick={onClose}>
                        Ok
                    </Button>
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
                    <Button className="actionButton" variant="outlined" color="default" onClick={onClose}>
                        Ok
                    </Button>
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
                <Button
                    className="actionButton"
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`connect?name=${name}`}>
                    Ok
                </Button>
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
                <Button className={classes.button} variant="outlined" color="primary">
                    Copy
                </Button>
            </section>
            <section>
                <Typography variant="h6">Step 2: Paste it into your profile biography</Typography>
                <Typography variant="body2">Hand-by-hand guides will show up after you move to the webpage.</Typography>
                <Button className={classNames(classes.button, classes.buttonLarge)} variant="outlined" color="primary">
                    Go to twitter.com
                </Button>
            </section>
            <section>
                <Typography variant="h6">Step 3: Test and finish</Typography>
                <Typography variant="body2">
                    Come back here and finish the procedure. Test if your setup is successful.
                </Typography>
                <Button
                    onClick={() => setState('success')}
                    className={classNames(classes.button, classes.buttonLarge)}
                    variant="contained"
                    color="primary">
                    Test
                </Button>
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
