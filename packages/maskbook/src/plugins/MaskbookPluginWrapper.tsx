import { makeStyles, Typography, ThemeProvider, SnackbarContent } from '@material-ui/core'
import { activatedSocialNetworkUI } from '../social-network'
import { MaskbookIcon } from '../resources/MaskbookIcon'
import { Suspense, useRef } from 'react'
import { isTwitter } from '../social-network-adaptor/twitter.com/base'

interface PluginWrapperProps {
    pluginName: string
    children?: JSX.Element | string
    width?: number
}

const useStyles = makeStyles((theme) => {
    return {
        card: {
            marginTop: theme.spacing(1),
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
        icon: {
            width: '3em',
            height: '3em',
        },
        body: {
            margin: theme.spacing(2),
        },
    }
})

export default function MaskbookPluginWrapper(props: PluginWrapperProps) {
    const classes = useStyles()
    const { pluginName, children } = props
    const useStableTheme = useRef(activatedSocialNetworkUI.customization.useTheme).current
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useStableTheme?.()

    const inner = (
        <div className={classes.card} onClick={(ev) => ev.stopPropagation()}>
            <div className={classes.header}>
                <MaskbookIcon className={classes.icon}></MaskbookIcon>
                <div className={classes.title}>
                    <Typography variant="overline">Mask Plugin</Typography>
                    <Typography variant="h6">{pluginName}</Typography>
                </div>
            </div>
            <div className={classes.body}>{children}</div>
        </div>
    )
    return (
        <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
            {theme ? <ThemeProvider theme={theme}>{inner}</ThemeProvider> : inner}
        </Suspense>
    )
}
