import React from 'react'
import { Typography, ButtonBase, ButtonBaseProps } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import type { Profile } from '../../../database'
import { Avatar } from '../../../utils/components/Avatar'
import { useModal } from '../Dialog/Base'
import { DashboardContactDialog } from '../Dialog/Contact'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: theme.spacing(2, 0),
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        avatar: {
            width: '32px',
            height: '32px',
        },
        user: {
            fontWeight: 500,
            margin: theme.spacing(0, 2),
            flex: '0 1 auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        provider: {
            color: 'var(--lightText)',
            marginRight: theme.spacing(2),
        },
        fingerprint: {
            marginLeft: 'auto',
            marginRight: 0,
            fontFamily: 'var(--monospace)',
        },
    }),
)

interface ContactLineProps extends ButtonBaseProps {
    contact: Profile
}

export function ContactLine(props: ContactLineProps) {
    const classes = useStyles()
    const { contact } = props
    const [contactDialog, openContactDialog] = useModal(DashboardContactDialog, { contact })
    return (
        <>
            <ButtonBase onClick={() => openContactDialog()} className={classes.line} {...props}>
                <Avatar className={classes.avatar} person={contact} />
                <Typography className={classes.user}>{contact.nickname || contact.identifier.userId}</Typography>
                <Typography className={classes.provider}>@{contact.identifier.network}</Typography>
                <Typography component="code" color="textSecondary" className={classes.fingerprint}>
                    {contact.linkedPersona?.fingerprint}
                </Typography>
            </ButtonBase>
            {contactDialog}
        </>
    )
}
