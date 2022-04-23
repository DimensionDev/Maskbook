import { Typography, SnackbarContent, Button, Link } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { activatedSocialNetworkUI } from '../social-network'
import { MaskIcon } from '../resources/MaskIcon'
import { Suspense, ReactNode, useMemo, forwardRef, useImperativeHandle, useState } from 'react'
import { isTwitter } from '../social-network-adaptor/twitter.com/base'
import { usePersonaConnectStatus } from '../components/DataSource/usePersonaConnectStatus'
import { useI18N } from '../utils'
import { Box } from '@mui/system'
import {
    usePluginI18NField,
    PluginI18NFieldRender,
    PluginWrapperComponent,
    Plugin,
    PluginWrapperMethods,
} from '@masknet/plugin-infra/content-script'
import { ProviderByIcon } from '@masknet/icons'
import type { CSSProperties } from '@emotion/serialize'

interface PluginWrapperProps extends React.PropsWithChildren<{}> {
    open?: boolean
    title: string
    width?: number
    action?: ReactNode
    publisher?: JSX.Element
    wrapperEntry?: Plugin.SNSAdaptor.WrapperEntry
    publisherLink?: string
}

const useStyles = makeStyles<{ style?: CSSProperties }>()((theme, props) => {
    return {
        card: {
            background:
                props?.style?.background ??
                'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF;',
            margin: theme.spacing(2, 0),
            width: '100%',
            boxSizing: 'border-box',
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
            padding: theme.spacing(1),
        },
        title: {
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: theme.spacing(1.5),
        },
        provider: {
            display: 'flex',
            alignItems: 'center',
            '& > a': {
                lineHeight: 0,
            },
        },
        action: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        body: {
            padding: theme.spacing(0),
        },
        button: {
            color: MaskColorVar.twitterButtonText,
            '&,&:hover': {
                background: MaskColorVar.twitterButton,
            },
        },
    }
})

export default function MaskPostExtraInfoWrapper(props: PluginWrapperProps) {
    const { open, title, children, action, publisher, publisherLink, wrapperEntry } = props
    const { classes } = useStyles({ style: wrapperEntry?.style })

    const personaConnectStatus = usePersonaConnectStatus()
    const { t } = useI18N()

    const name = !personaConnectStatus.hasPersona
        ? t('please_create_persona')
        : !personaConnectStatus.connected
        ? t('please_connect_persona')
        : title

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
        const main = (
            <Typography variant="body1" fontSize={14} fontWeight="500" color={MaskColorVar.textPrimary}>
                {publisher}
            </Typography>
        )
        return (
            <Box className={classes.provider}>
                <Typography variant="body1" fontSize={14} fontWeight="400" color={MaskColorVar.textSecondary}>
                    {t('plugin_provider_by')}
                </Typography>
                {'  '}
                {main}
                {publisherLink ? (
                    <Link href={publisherLink} underline="none" target="_blank" rel="noopener">
                        <ProviderByIcon />
                    </Link>
                ) : null}
            </Box>
        )
    }, [publisher, publisherLink])

    const inner = (
        <div
            className={classes.card}
            style={{ display: open ? 'block' : 'none' }}
            onClick={(ev) => ev.stopPropagation()}>
            <div className={classes.header}>
                {wrapperEntry?.icon ?? <MaskIcon size={16} />}
                <Typography variant="body1" fontSize={15} fontWeight="700">
                    {title ?? t('plugin_default_title')}
                </Typography>

                <div className={classes.action}>{actionButton || action || publisherInfo}</div>
            </div>
            {personaConnectStatus.connected && children ? <div className={classes.body}>{children}</div> : null}
        </div>
    )
    return <Suspense fallback={<SnackbarContent message="Mask is loading this content..." />} children={inner} />
}

export const MaskPostExtraPluginWrapper: PluginWrapperComponent<Plugin.SNSAdaptor.Definition> = forwardRef(
    (props, ref) => {
        const { ID, name, publisher, wrapperEntry } = props.definition
        const t = usePluginI18NField()
        const [width, setWidth] = useState<undefined | number>(undefined)
        const [open, setOpen] = useState<boolean>(false)
        const [title, setTitle] = useState<string | undefined>(undefined)

        const refItem = useMemo((): PluginWrapperMethods => {
            return {
                setWidth,
                setWrap: setOpen,
                setWrapperName: setTitle,
            }
        }, [])

        useImperativeHandle(ref, () => refItem, [refItem])

        return (
            <MaskPostExtraInfoWrapper
                wrapperEntry={wrapperEntry}
                open={open}
                title={title || t(ID, name)}
                width={width}
                publisher={publisher ? <PluginI18NFieldRender pluginID={ID} field={publisher.name} /> : undefined}
                publisherLink={publisher?.link}
                children={props.children}
            />
        )
    },
)
