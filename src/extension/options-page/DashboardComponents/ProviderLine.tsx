import { FormControl, Typography, Theme } from '@material-ui/core'
import React from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import classNames from 'classnames'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        text: {
            width: '200px',
            display: 'block',
            color: theme.palette.primary.main,
        },
        control: {
            display: 'flex',
            textAlign: 'left',
            width: '100%',
        },
        controlBorder: {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        connected: {
            color: theme.palette.text.primary,
        },
        pointer: {
            cursor: 'pointer',
        },
    }),
)

interface ProviderLineProps {
    network: string
    connected?: boolean
    userId?: string
    border?: boolean
    onConnect?: () => any
}

export default function ProviderLine(props: ProviderLineProps) {
    const { network, connected, userId, border, onConnect } = props
    const classes = useStyles()

    return (
        <FormControl className={classNames(classes.control, { [classes.controlBorder]: border })}>
            <Typography variant="overline">{network}</Typography>
            <Typography
                variant="body1"
                component="a"
                onClick={onConnect}
                className={classNames(
                    classes.text,
                    { [classes.connected]: connected },
                    { [classes.pointer]: !connected },
                )}>
                {connected ? `Connected: @${userId}` : `Connect ${network}`}
            </Typography>
        </FormControl>
    )
}
