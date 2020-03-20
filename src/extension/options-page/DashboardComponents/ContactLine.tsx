import React from 'react'
import { Avatar, Typography } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Profile } from '../../../database'

const useStyles = makeStyles(theme =>
    createStyles({
        line: {
            display: 'flex',
            alignItems: 'center',
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

interface ContactLineProps {
    contact: Profile
}

const mapColor = (string: string) => {
    const hash = [...string].reduce((prev, current) => {
        // eslint-disable-next-line no-bitwise
        const next = current.charCodeAt(0) + (prev << 5) - prev
        // eslint-disable-next-line no-bitwise
        return next & next
    }, 0)
    return `hsl(${hash % 360}, 98%, 70%)`
}

export function ContactLine(props: ContactLineProps) {
    const classes = useStyles()
    const { contact } = props
    const name = contact.nickname || contact.identifier.userId || ''
    return (
        <div className={classes.line}>
            <Avatar className={classes.avatar} src={contact.avatar} style={{ backgroundColor: mapColor(name) }}>
                {name.slice(0, 1)}
            </Avatar>
            <Typography className={classes.user}>{contact.nickname || contact.identifier.userId}</Typography>
            <Typography className={classes.provider}>@{contact.identifier.network}</Typography>
            <Typography component="code" color="textSecondary" className={classes.fingerprint}>
                {contact.linkedPersona?.fingerprint}
            </Typography>
        </div>
    )
}
