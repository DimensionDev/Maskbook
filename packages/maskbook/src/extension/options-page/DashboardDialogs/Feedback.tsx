import React, { useState } from 'react'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from './Base'
import { Smile as SmileIcon } from 'react-feather'
import { TextField } from '@material-ui/core'
import { DebounceButton } from '../DashboardComponents/ActionButton'
import { useI18N } from '../../../utils/i18n-next-ui'

export function DashboardFeedbackDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<SmileIcon />}
                iconColor="#F8B03E"
                primary={t('feedback')}
                content={
                    <form>
                        <TextField
                            required
                            autoFocus
                            label={t('name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {/* Todo: fix the whole feedback loop asap, now just mailto info@dimension.im */}
                        <TextField
                            style={{ display: 'none' }}
                            required
                            label={t('email')}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            multiline
                            rows={4}
                            required
                            label={t('your_message')}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </form>
                }
                footer={
                    <DebounceButton
                        variant="contained"
                        disabled={Boolean(!name || !message)}
                        onClick={async () => {
                            const url = new URL(`mailto:${t('dashboard_email_address')}`)
                            url.searchParams.set('subject', name)
                            url.searchParams.set('body', message)
                            window.open(url.toString())
                        }}>
                        {t('submit')}
                    </DebounceButton>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
