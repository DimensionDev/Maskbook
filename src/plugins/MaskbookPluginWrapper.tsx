import React from 'react'
import { makeStyles, createStyles, Typography } from '@material-ui/core'
import { getUrl } from '../utils/utils'

interface PluginWrapperProps {
    pluginName: string
    children?: JSX.Element | string
    width?: number
}

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            border: `1px solid ${theme.palette.divider}`,
            cursor: 'default',
        },
        header: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(1, 2),
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        title: {
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: theme.spacing(1),
        },
        icon: {
            width: '3em',
            height: '3em',
        },
        body: {
            margin: theme.spacing(2),
        },
    }),
)

export default function MaskbookPluginWrapper(props: PluginWrapperProps) {
    const classes = useStyles()
    const { pluginName, children, width } = props
    return (
        <div className={classes.card} style={{ width }}>
            <div className={classes.header}>
                <img src={getUrl('/maskbook-icon.png')} className={classes.icon} />
                <div className={classes.title}>
                    <Typography variant="overline">Maskbook Plugin</Typography>
                    <Typography variant="h6">{pluginName}</Typography>
                </div>
            </div>
            <div className={classes.body}>{children}</div>
        </div>
    )
}
