import React from 'react'
import { Typography, ButtonBase, ButtonBaseProps } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import type { Profile } from '../../../database'
import { Avatar } from '../../../utils/components/Avatar'
import { useModal } from '../Dialog/Base'
import { DashboardContactDialog } from '../Dialog/Contact'
import { Skeleton } from '@material-ui/lab'

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
            color: theme.palette.text.primary,
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
    const { contact, ...rest } = props
    const [contactDialog, openContactDialog] = useModal(DashboardContactDialog, { contact })
    return (
        <>
            <ButtonBase onClick={() => openContactDialog()} className={classes.line} {...rest}>
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

export function ContactLineSkeleton(props: ButtonBaseProps) {
    const classes = useStyles()
    const text = (len: number) => <Skeleton height={16} width={len} />
    return (
        <>
            <ButtonBase disabled className={classes.line} {...props}>
                <Skeleton variant="circle" className={classes.avatar} />
                <Typography className={classes.user}>{text(16 * 10)}</Typography>
                <Typography className={classes.provider}>{text(16 * 5)}</Typography>
                <Typography component="code" color="textSecondary" className={classes.fingerprint}>
                    {text(16 * 25)}
                </Typography>
            </ButtonBase>
        </>
    )
}
