import { Typography, SnackbarContent, Button, Link } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { MaskIcon } from '../resources/MaskIcon'
import { Suspense, ReactNode, useMemo, forwardRef, useImperativeHandle, useState } from 'react'
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

interface PluginWrapperProps extends React.PropsWithChildren<{}> {
    open?: boolean
    title: JSX.Element | string
    width?: number
    content?: ReactNode
    action?: ReactNode
    publisher?: JSX.Element
    wrapperProps?: Plugin.SNSAdaptor.PluginWrapperProps
    publisherLink?: string
}

const useStyles = makeStyles<{ backgroundGradient?: string }>()((theme, props) => {
    return {
        card: {
            background:
                props?.backgroundGradient ??
                'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF;',
            margin: theme.spacing(2, 0),
            width: '100%',
            boxSizing: 'border-box',
            cursor: 'default',
            borderRadius: 15,
            overflow: 'hidden',
        },
        header: {
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            padding: 15,
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
        publish: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        action: {
            textAlign: 'center',
            margin: theme.spacing(1),
            position: 'absolute',
            width: '100%',
            bottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        body: {
            padding: theme.spacing(0),
        },
        button: {
            backgroundColor: MaskColorVar.buttonPluginBackground,
            color: 'white',
            width: 254,
            '&,&:hover': {
                background: MaskColorVar.buttonPluginBackground,
            },
            borderRadius: 9999,
        },
    }
})

export default function MaskPostExtraInfoWrapper(props: PluginWrapperProps) {
    const { open, title, children, action, publisher, publisherLink, content, wrapperProps } = props
    const { classes } = useStyles({ backgroundGradient: wrapperProps?.backgroundGradient })

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
        if (!publisher) return
        const main = (
            <Typography variant="body1" fontSize={14} fontWeight="500" color={MaskColorVar.textPluginColor}>
                {publisher}
            </Typography>
        )
        return (
            <Box className={classes.provider}>
                <Typography sx={{ marginRight: 0.5 }} variant="body1" fontSize={14} fontWeight="400" color="#767F8D">
                    {t('plugin_provider_by')}
                </Typography>
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
                {wrapperProps?.icon ?? (
                    <MaskIcon
                        style={{ filter: 'drop-shadow(0px 6px 12px rgba(28, 104, 243, 0.2))', width: 16, height: 16 }}
                    />
                )}
                <Typography
                    sx={{ marginLeft: 0.5 }}
                    variant="body1"
                    fontSize={15}
                    fontWeight="700"
                    color={MaskColorVar.textPluginColor}>
                    {title ?? t('plugin_default_title')}
                </Typography>
                <div className={classes.publish}>{publisherInfo}</div>
            </div>
            {personaConnectStatus.connected && children ? (
                <div className={classes.body}>{children}</div>
            ) : (
                <>
                    <Typography variant="body1" color={MaskColorVar.errorPlugin} sx={{ padding: 1 }} textAlign="center">
                        {content ?? name}
                    </Typography>
                    <div className={classes.action}>{actionButton || action || publisherInfo}</div>
                </>
            )}
        </div>
    )

    return <Suspense fallback={<SnackbarContent message="Mask is loading this content..." />} children={inner} />
}

export const MaskPostExtraPluginWrapper: PluginWrapperComponent<Plugin.SNSAdaptor.Definition> = forwardRef(
    (props, ref) => {
        const { ID, name, publisher, wrapperProps } = props.definition
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
                wrapperProps={wrapperProps}
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
