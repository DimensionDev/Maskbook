import { Typography, SnackbarContent, Button, Link } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { activatedSocialNetworkUI } from '../social-network'
import { MaskIcon } from '../resources/MaskIcon'
import { Suspense, ReactNode, useMemo } from 'react'
import { isTwitter } from '../social-network-adaptor/twitter.com/base'
import { usePersonaConnectStatus } from '../components/DataSource/usePersonaConnectStatus'
import { useI18N } from '../utils'
import { Box } from '@mui/system'
import { Plugin, I18NStringField, usePluginI18NField } from '@masknet/plugin-infra'

interface PluginWrapperProps extends React.PropsWithChildren<{}> {
    pluginName: string
    width?: number
    action?: ReactNode
    publisher?: Plugin.Shared.Publisher
}

const useStyles = makeStyles()((theme) => {
    return {
        card: {
            margin: theme.spacing(2, 0),
            width: '100%',
            boxSizing: 'border-box',
            border: `1px solid ${theme.palette.secondaryDivider}`,
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
            borderTop: `1px solid ${theme.palette.secondaryDivider}`,
            padding: theme.spacing(2),
        },
        button: {
            color: MaskColorVar.twitterButtonText,
            '&,&:hover': {
                background: MaskColorVar.twitterButton,
            },
        },
    }
})

export default function MaskPluginWrapper(props: PluginWrapperProps) {
    const { classes } = useStyles()
    const { pluginName, children, action, publisher } = props
    const personaConnectStatus = usePersonaConnectStatus()
    const { t } = useI18N()

    const name = !personaConnectStatus.hasPersona
        ? t('please_create_persona')
        : !personaConnectStatus.connected
        ? t('please_connect_persona')
        : pluginName

    const actionButton = useMemo(() => {
        if (!personaConnectStatus.action) return null

        const button = personaConnectStatus.hasPersona ? t('connect_persona') : t('create_persona')
        return (
            <Button variant="contained" className={classes.button} onClick={personaConnectStatus.action}>
                {button}
            </Button>
        )
    }, [personaConnectStatus, t])

    const publisherInfo = useMemo(() => {
        if (!publisher) return null
        return (
            <Box>
                <Typography variant="h6" fontSize="1.1rem" fontWeight="400" color={MaskColorVar.textSecondary}>
                    Provided by
                </Typography>
                <Link href={publisher.link} underline="none" target="_blank" rel="noopener">
                    <Typography variant="h6" fontSize="1.1rem" fontWeight="400" color={MaskColorVar.textPrimary}>
                        {publisher.name.fallback}
                    </Typography>
                </Link>
            </Box>
        )
    }, [publisher])

    const inner = (
        <div className={classes.card} onClick={(ev) => ev.stopPropagation()}>
            <div className={classes.header}>
                <MaskIcon size={45} />
                <div className={classes.title}>
                    <Typography variant="h6" fontSize="1.1rem" fontWeight="400">
                        Mask Plugin {!personaConnectStatus.connected && pluginName ? `(${pluginName})` : ''}
                    </Typography>
                    <Typography variant="h6" fontSize="1.1rem" fontWeight="400">
                        {name}
                    </Typography>
                </div>
                <div className={classes.action}>{actionButton || action || publisherInfo}</div>
            </div>
            {personaConnectStatus.connected && children ? <div className={classes.body}>{children}</div> : null}
        </div>
    )
    return <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />} children={inner} />
}

export function generatePluginWrapper(pluginID: string, pluginName: I18NStringField) {
    return function PluginWrapper(props: React.PropsWithChildren<{}>) {
        const t = usePluginI18NField()
        return <MaskPluginWrapper pluginName={t(pluginID, pluginName)} children={props.children} />
    }
}
