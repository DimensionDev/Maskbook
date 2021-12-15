import { Typography, SnackbarContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { activatedSocialNetworkUI } from '../social-network'
import { MaskIcon } from '../resources/MaskIcon'
import { Suspense, ReactNode } from 'react'
import { isTwitter } from '../social-network-adaptor/twitter.com/base'

interface PluginWrapperProps extends React.PropsWithChildren<{}> {
    pluginName: string
    width?: number
    action?: ReactNode
}

const useStyles = makeStyles()((theme) => {
    return {
        card: {
            margin: theme.spacing(2, 0),
            width: '100%',
            boxSizing: 'border-box',
            border: `1px solid ${theme.palette.divider}`,
            cursor: 'default',
            ...(isTwitter(activatedSocialNetworkUI)
                ? {
                      borderRadius: 15,
                      overflow: 'hidden',
                  }
                : null),
        },
        header: {
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(2),
        },
        title: {
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: theme.spacing(1.5),
        },
        action: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        body: {
            borderTop: `1px solid ${theme.palette.divider}`,
            padding: theme.spacing(2),
        },
    }
})

export default function MaskPluginWrapper(props: PluginWrapperProps) {
    const { classes } = useStyles()
    const { pluginName, children, action } = props

    const inner = (
        <div className={classes.card} onClick={(ev) => ev.stopPropagation()}>
            <div className={classes.header}>
                <MaskIcon size={36} />
                <div className={classes.title}>
                    <Typography variant="h6" fontSize="14px">
                        Mask Plugin
                    </Typography>
                    <Typography variant="h6" fontSize="14px">
                        {pluginName}
                    </Typography>
                </div>
                <div className={classes.action}>{action}</div>
            </div>
            {children ? <div className={classes.body}>{children}</div> : null}
        </div>
    )
    return <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />} children={inner} />
}
