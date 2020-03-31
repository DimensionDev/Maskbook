import React, { useState } from 'react'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from './Base'
import { Smile as SmileIcon } from 'react-feather'
import { TextField } from '@material-ui/core'
import { ThrottledButton } from '../DashboardComponents/ActionButton'

export function DashboardFeedbackDialog(props: WrappedDialogProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper icon={<SmileIcon />} iconColor="#F8B03E" primary="Feedback">
                <form>
                    <TextField required label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField required label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField
                        multiline
                        rows={4}
                        required
                        label="Your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </form>
                <ThrottledButton variant="contained" color="primary">
                    Submit
                </ThrottledButton>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
