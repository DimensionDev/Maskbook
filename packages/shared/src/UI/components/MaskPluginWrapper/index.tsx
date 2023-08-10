import { Typography, SnackbarContent, Link } from '@mui/material'
import { makeStyles, MaskColorVar, MaskLightTheme } from '@masknet/theme'
import { Suspense, type ReactNode, useMemo, forwardRef, useImperativeHandle, useState } from 'react'
import { useSharedI18N } from '@masknet/shared'
import { Box } from '@mui/system'
import {
    usePluginI18NField,
    PluginI18NFieldRender,
    type PluginWrapperComponent,
    type Plugin,
    type PluginWrapperMethods,
} from '@masknet/plugin-infra/content-script'
import { Icons } from '@masknet/icons'

interface PluginWrapperProps extends React.PropsWithChildren<{}> {
    open?: boolean
    title: JSX.Element | string
    width?: number
    content?: ReactNode
    action?: ReactNode
    publisher?: JSX.Element
    wrapperProps?: Plugin.SiteAdaptor.PluginWrapperProps
    publisherLink?: string
    lackHostPermission?: boolean
    ID: string
}

const useStyles = makeStyles<{
    backgroundGradient?: string
    borderRadius?: string
    margin?: string
}>()((theme, props) => {
    return {
        card: {
            background:
                props?.backgroundGradient ??
                'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF;',
            margin: props?.margin ?? theme.spacing(2, 0),
            width: '100%',
            boxSizing: 'border-box',
            cursor: 'default',
            borderRadius: props?.borderRadius ?? 15,
            overflow: 'hidden',
        },
        header: {
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(1.5),
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
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        body: {
            padding: theme.spacing(0),
        },
        providerBy: {
            marginRight: theme.spacing(0.5),
            fontSize: 14,
            fontWeight: 700,
            color: MaskLightTheme.palette.maskColor.second,
        },
    }
})

export function MaskPostExtraInfoWrapper(props: PluginWrapperProps) {
    const { open, title, children, action, publisher, publisherLink, content, wrapperProps, ID } = props
    const { classes } = useStyles({
        backgroundGradient: wrapperProps?.backgroundGradient,
        borderRadius: wrapperProps?.borderRadius,
        margin: wrapperProps?.margin,
    })
    const t = useSharedI18N()

    const publisherInfo = useMemo(() => {
        if (!publisher) return
        const main = (
            <Typography
                variant="body1"
                fontSize={14}
                fontWeight="700"
                component="div"
                color={MaskColorVar.textPluginColor}>
                {publisher}
            </Typography>
        )
        return (
            <Box className={classes.provider}>
                <Typography variant="body1" className={classes.providerBy}>
                    {t.powered_by()}
                </Typography>
                {main}
                {publisherLink ? (
                    <Link href={publisherLink} underline="none" target="_blank" rel="noopener">
                        <Icons.Provider
                            size={18}
                            style={{ marginLeft: 4 }}
                            color={MaskLightTheme.palette.maskColor.main}
                        />
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
                    <Icons.MaskBlue size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(28, 104, 243, 0.2))' }} />
                )}
                <Typography
                    sx={{ marginLeft: 0.5 }}
                    variant="body1"
                    fontSize={16}
                    fontWeight={700}
                    component="div"
                    color={MaskColorVar.textPluginColor}>
                    {wrapperProps?.title ?? title ?? t.plugin_default_title()}
                </Typography>
                <div className={classes.publish}>{publisherInfo}</div>
            </div>
            {action ? (
                <>
                    <Typography component="div" variant="body1" color="#FF3545" sx={{ padding: 1 }} textAlign="center">
                        {content}
                    </Typography>
                    <div className={classes.action}>{action}</div>
                </>
            ) : null}
            {children ? <div className={classes.body}>{children}</div> : null}
        </div>
    )

    return <Suspense fallback={<SnackbarContent message="Mask is loading this content..." />} children={inner} />
}

export const MaskPostExtraPluginWrapper: PluginWrapperComponent<Plugin.SiteAdaptor.Definition> = forwardRef(
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
                ID={props.definition.ID}
                wrapperProps={wrapperProps}
                open={open}
                title={title || t(ID, name)}
                width={width}
                publisher={publisher ? <PluginI18NFieldRender pluginID={ID} field={publisher.name} /> : undefined}
                publisherLink={publisher?.link}
                children={props.children}
                lackHostPermission={props.lackHostPermission}
            />
        )
    },
)
