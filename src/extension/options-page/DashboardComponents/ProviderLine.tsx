import { FormControl, Typography, Theme } from '@material-ui/core'
import React from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import classNames from 'classnames'
import { useI18N } from '../../../utils/i18n-next-ui'

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
    onConnect?: () => void
}

export default function ProviderLine(props: ProviderLineProps) {
    const { t } = useI18N()
    const { network, connected, userId, onConnect } = props
    const classes = useStyles()

    return (
        <FormControl className={classes.control}>
            <Typography variant="overline">{network}</Typography>
            <Typography
                variant="body1"
                component="a"
                onClick={connected ? undefined : onConnect}
                className={classNames(
                    classes.text,
                    { [classes.connected]: connected },
                    { [classes.pointer]: !connected },
                )}
                data-testid={`initialization_connect_button_${network.toLowerCase()}`}>
                {connected ? `${t('dashboard_connected')}: @${userId}` : `${t('connect')} ${network}`}
            </Typography>
        </FormControl>
    )
}
