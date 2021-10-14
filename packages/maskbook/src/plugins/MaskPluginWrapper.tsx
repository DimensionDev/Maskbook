import { Typography, SnackbarContent } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { activatedSocialNetworkUI } from '../social-network'
import { MaskIcon } from '../resources/MaskIcon'
import { Suspense } from 'react'
import { isTwitter } from '../social-network-adaptor/twitter.com/base'

interface PluginWrapperProps extends React.PropsWithChildren<{}> {
    pluginName: string
    width?: number
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
        body: {
            margin: theme.spacing(2),
        },
    }
})

export default function MaskPluginWrapper(props: PluginWrapperProps) {
    const { classes } = useStyles()
    const { pluginName, children } = props

    const inner = (
        <div className={classes.card} onClick={(ev) => ev.stopPropagation()}>
            <div className={classes.header}>
                <MaskIcon size={48} />
                <div className={classes.title}>
                    <Typography variant="overline">Mask Plugin</Typography>
                    <Typography variant="h6">{pluginName}</Typography>
                </div>
            </div>
            <div className={classes.body}>{children}</div>
        </div>
    )
    return <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />} children={inner} />
}
