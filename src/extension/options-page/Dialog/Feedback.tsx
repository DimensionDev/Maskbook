import React, { useState } from 'react'
import { DashboardDialogWrapper } from './Base'
import { Smile as SmileIcon } from 'react-feather'
import { Button, TextField } from '@material-ui/core'

export function DashboardFeedbackDialog() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    return (
        <DashboardDialogWrapper icon={<SmileIcon />} iconColor="#F8B03E" primary="Feedback">
            <form>
                <TextField placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                <TextField placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <TextField
                    multiline
                    rows={4}
                    placeholder="Your message..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
            </form>
            <Button variant="contained" color="primary">
                Submit
            </Button>
        </DashboardDialogWrapper>
    )
}
