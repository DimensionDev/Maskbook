import { useCallback, useState, useRef, memo, useImperativeHandle, useMemo, type Ref, type RefAttributes } from 'react'
import { Result } from 'ts-results-es'
import {
    useActivatedPluginsSiteAdaptor,
    type Plugin,
    PluginTransFieldRender,
    usePluginTransField,
    useCompositionContext,
} from '@masknet/plugin-infra/content-script'
import { DialogContent, alpha } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ClickableChip, GrantPermissions, InjectedDialog, usePluginHostPermissionCheck } from '@masknet/shared'
import { EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { requestHostPermission } from '@masknet/plugin-infra/dom/context'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    sup: {
        paddingLeft: 2,
    },
    clickRoot: {
        background: theme.palette.maskColor.bottom,
        boxShadow: `0px 0px 20px 0px ${alpha(theme.palette.maskColor.main, 0.05)}`,
        marginBottom: 0,
    },
}))

export interface PluginEntryRenderRef {
    openPlugin(id: string, pluginProps?: any): void
}
interface PluginEntryRenderProps extends RefAttributes<PluginEntryRenderRef> {
    readonly: boolean
    isOpenFromApplicationBoard: boolean
}
export const PluginEntryRender = memo((props: PluginEntryRenderProps) => {
    const [trackPluginRef] = useSetPluginEntryRenderRef(props.ref)
    const pluginField = usePluginTransField()
    const plugins = [...useActivatedPluginsSiteAdaptor('any')].sort((plugin) => {
        // TODO: support priority order
        if (plugin.ID === PluginID.RedPacket) return -1
        return 1
    })
    const lackPermission = usePluginHostPermissionCheck(plugins)
    const result = plugins.map((plugin) =>
        Result.wrap(() => {
            const entry = plugin.CompositionDialogEntry
            const unstable = plugin.enableRequirement.target !== 'stable'
            const ID = plugin.ID
            if (!entry) return null
            const extra: ExtraPluginProps = { unstable, id: ID, readonly: props.readonly }
            if (lackPermission?.has(ID)) {
                return (
                    <ErrorBoundary subject={`Plugin "${pluginField(ID, plugin.name)}"`} key={plugin.ID}>
                        <DialogEntry
                            label={entry.label}
                            {...extra}
                            dialog={getPluginEntryDisabledDialog(plugin)}
                            ref={trackPluginRef(ID)}
                            isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                        />
                    </ErrorBoundary>
                )
            }
            return (
                <ErrorBoundary subject={`Plugin "${pluginField(ID, plugin.name)}"`} key={plugin.ID}>
                    {'onClick' in entry ?
                        <CustomEntry {...entry} {...extra} ref={trackPluginRef(ID)} />
                    :   <DialogEntry
                            {...entry}
                            {...extra}
                            ref={trackPluginRef(ID)}
                            isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                        />
                    }
                </ErrorBoundary>
            )
        }).unwrapOr(null),
    )
    return <>{result}</>
})

const usePermissionDialogStyles = makeStyles()((theme) => ({
    root: {
        width: 384,
        padding: theme.spacing(1),
    },
    dialogTitle: {
        background: theme.palette.maskColor.bottom,
    },
    action: {
        width: '80%',
    },
}))

const cache = new Map<
    Plugin.Shared.Definition,
    React.ComponentType<Plugin.SiteAdaptor.CompositionDialogEntry_DialogProps>
>()
function getPluginEntryDisabledDialog(define: Plugin.Shared.Definition) {
    if (!cache.has(define)) {
        cache.set(define, (props: Plugin.SiteAdaptor.CompositionDialogEntry_DialogProps) => {
            const { classes } = usePermissionDialogStyles()
            return (
                <InjectedDialog
                    classes={{ paper: classes.root, dialogTitle: classes.dialogTitle }}
                    title={<Trans>Domain Request</Trans>}
                    open={props.open}
                    onClose={props.onClose}
                    maxWidth="sm"
                    titleBarIconStyle="close">
                    <DialogContent>
                        <GrantPermissions
                            classes={{ action: classes.action }}
                            permissions={define.enableRequirement.host_permissions ?? EMPTY_LIST}
                            onGrant={() =>
                                requestHostPermission?.(define.enableRequirement.host_permissions ?? EMPTY_LIST)
                            }
                        />
                    </DialogContent>
                </InjectedDialog>
            )
        })
    }
    return cache.get(define)!
}

function useSetPluginEntryRenderRef(ref: Ref<PluginEntryRenderRef> | undefined) {
    const pluginRefs = useRef<Record<string, PluginRef | undefined | null>>({})
    const refItem: PluginEntryRenderRef = useMemo(
        () => ({
            openPlugin: function openPlugin(id: string, props: any = {}, tryTimes = 4) {
                const ref = pluginRefs.current[id]
                if (ref) return ref.open(props)

                // If the plugin has not been loaded yet, we wait for at most 2000ms
                if (tryTimes === 0) return
                setTimeout(() => openPlugin(id, props, tryTimes - 1), 500)
            },
        }),
        [],
    )
    useImperativeHandle(ref, () => refItem, [refItem])
    const trackPluginRef = (pluginID: string) => (ref: PluginRef | null) => {
        pluginRefs.current = { ...pluginRefs.current, [pluginID]: ref }
    }
    return [trackPluginRef]
}
function useSetPluginRef(ref: Ref<PluginRef> | undefined, onClick: (props: any) => void) {
    const refItem = useMemo(() => ({ open: onClick }), [onClick])
    useImperativeHandle(ref, () => refItem, [refItem])
}

interface PluginRef {
    open(props: any): void
}
interface ExtraPluginProps extends RefAttributes<PluginRef> {
    unstable: boolean
    id: string
    readonly: boolean
    isOpenFromApplicationBoard?: boolean
}
const CustomEntry = memo((props: Plugin.SiteAdaptor.CompositionDialogEntryCustom & ExtraPluginProps) => {
    const { classes } = useStyles()
    const { id, label, onClick, unstable, ref } = props
    useSetPluginRef(ref, onClick)
    const { type, getMetadata } = useCompositionContext()
    return (
        <ClickableChip
            classes={{
                root: classes.clickRoot,
            }}
            label={
                <>
                    <PluginTransFieldRender field={label} pluginID={id} />
                    {unstable ?
                        <sup className={classes.sup}>
                            <Trans>(beta)</Trans>
                        </sup>
                    :   null}
                </>
            }
            onClick={() => {
                const metadata = getMetadata()
                onClick?.({ compositionType: type, metadata })
            }}
            disabled={props.readonly}
        />
    )
})

const DialogEntry = memo((props: Plugin.SiteAdaptor.CompositionDialogEntryDialog & ExtraPluginProps) => {
    const { classes } = useStyles()
    const { dialog: Dialog, id, label, unstable, keepMounted, isOpenFromApplicationBoard, ref } = props
    const [dialogProps, setDialogProps] = useState({})
    const [open, setOpen] = useState(false)
    const opener = useCallback((props: any = {}) => {
        setDialogProps(props)
        setOpen(true)
    }, [])
    const close = useCallback(() => {
        setOpen(false)
    }, [])

    useSetPluginRef(ref, opener)
    const chip = (
        <ClickableChip
            classes={{
                root: classes.clickRoot,
            }}
            label={
                <>
                    <PluginTransFieldRender field={label} pluginID={id} />
                    {unstable ?
                        <sup className={classes.sup}>
                            <Trans>(beta)</Trans>
                        </sup>
                    :   null}
                </>
            }
            disabled={props.readonly}
            onClick={opener}
        />
    )
    if (keepMounted || open)
        return (
            <>
                {chip}
                <span style={{ display: 'none' }}>
                    {/* Dialog should use portals to render. */}
                    <Dialog
                        open={open}
                        onClose={close}
                        isOpenFromApplicationBoard={isOpenFromApplicationBoard}
                        {...dialogProps}
                    />
                </span>
            </>
        )
    return chip
})

DialogEntry.displayName = 'DialogEntry'
