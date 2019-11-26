import { FormControl, Typography, Theme } from '@material-ui/core'
import React from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import classNames from 'classnames'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        text: {
            width: '200px',
            display: 'block',
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
    }),
)

interface ProviderLineProps {
    network: string
    connected?: boolean
    id?: string
    border?: boolean
    onConnect?: () => any
}

export default function ProviderLine(props: ProviderLineProps) {
    const { network, connected, id, border } = props
    const classes = useStyles()

    return (
        <FormControl className={classNames(classes.control, { [classes.controlBorder]: border })}>
            <Typography variant="caption">{network}</Typography>
            <Typography variant="body1" className={classes.text}>
                {connected ? `Connected: ${id}` : `Connect ${network}`}
            </Typography>
        </FormControl>
    )
}
