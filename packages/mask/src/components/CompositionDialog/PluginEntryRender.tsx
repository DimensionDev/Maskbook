import { useCallback, useState, useRef, forwardRef, memo, useImperativeHandle, useMemo } from 'react'
import { Trans } from 'react-i18next'
import { Result } from 'ts-results'
import {
    useActivatedPluginsSNSAdaptor,
    Plugin,
    PluginI18NFieldRender,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { DialogContent } from '@mui/material'
import { makeStyles, MaskDialog } from '@masknet/theme'
import { PluginID } from '@masknet/shared-base'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { ClickableChip } from '../shared/SelectRecipients/ClickableChip.js'
import { usePluginHostPermissionCheck } from '../DataSource/usePluginHostPermission.js'
import { PossiblePluginSuggestionUISingle } from '../InjectedComponents/DisabledPluginSuggestion.js'

const useStyles = makeStyles()((theme) => ({
    sup: {
        paddingLeft: 2,
    },
    clickRoot: {
        background: theme.palette.background.paper,
        boxShadow: `0px 0px 20px 0px ${theme.palette.mode === 'dark' ? '#FFFFFF1F' : '#0000000D'}`,
    },
}))
export interface PluginEntryRenderRef {
    openPlugin(id: string): void
}
export const PluginEntryRender = memo(
    forwardRef<
        PluginEntryRenderRef,
        {
            readonly: boolean
            isOpenFromApplicationBoard: boolean
        }
    >((props, ref) => {
        const [trackPluginRef] = useSetPluginEntryRenderRef(ref)
        const pluginField = usePluginI18NField()
        const plugins = [...useActivatedPluginsSNSAdaptor('any')].sort((plugin) => {
            // TODO: support priority order
            if (plugin.ID === PluginID.RedPacket || plugin.ID === PluginID.ITO) return -1
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
                        {'onClick' in entry ? (
                            <CustomEntry {...entry} {...extra} ref={trackPluginRef(ID)} />
                        ) : (
                            <DialogEntry
                                {...entry}
                                {...extra}
                                ref={trackPluginRef(ID)}
                                isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                            />
                        )}
                    </ErrorBoundary>
                )
            }).unwrapOr(null),
        )
        return <>{result}</>
    }),
)

const cache = new Map<
    Plugin.Shared.Definition,
    React.ComponentType<Plugin.SNSAdaptor.CompositionDialogEntry_DialogProps>
>()
function getPluginEntryDisabledDialog(define: Plugin.Shared.Definition) {
    if (!cache.has(define)) {
        cache.set(define, (props: Plugin.SNSAdaptor.CompositionDialogEntry_DialogProps) => {
            return (
                <MaskDialog title="Grant permission" open={props.open} onClose={props.onClose}>
                    <DialogContent>
                        <PossiblePluginSuggestionUISingle define={define} />
                    </DialogContent>
                </MaskDialog>
            )
        })
    }
    return cache.get(define)!
}

function useSetPluginEntryRenderRef(ref: React.ForwardedRef<PluginEntryRenderRef>) {
    const pluginRefs = useRef<Record<string, PluginRef | undefined | null>>({})
    const refItem: PluginEntryRenderRef = useMemo(
        () => ({
            openPlugin: function openPlugin(id: string, tryTimes = 4) {
                const ref = pluginRefs.current[id]
                if (ref) return ref.open()

                // If the plugin has not been loaded yet, we wait for at most 2000ms
                if (tryTimes === 0) return
                setTimeout(() => openPlugin(id, tryTimes - 1), 500)
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
function useSetPluginRef(ref: React.ForwardedRef<PluginRef>, onClick: () => void) {
    const refItem = useMemo(() => ({ open: onClick }), [onClick])
    useImperativeHandle(ref, () => refItem, [refItem])
}

type PluginRef = {
    open(): void
}
type ExtraPluginProps = {
    unstable: boolean
    id: string
    readonly: boolean
    isOpenFromApplicationBoard?: boolean
}
const CustomEntry = memo(
    forwardRef<PluginRef, Plugin.SNSAdaptor.CompositionDialogEntryCustom & ExtraPluginProps>((props, ref) => {
        const { classes } = useStyles()
        const { id, label, onClick, unstable } = props
        useSetPluginRef(ref, onClick)
        return (
            <ClickableChip
                classes={{
                    root: classes.clickRoot,
                }}
                label={
                    <>
                        <PluginI18NFieldRender field={label} pluginID={id} />
                        {unstable && <Trans i18nKey="beta_sup" components={{ sup: <sup className={classes.sup} /> }} />}
                    </>
                }
                onClick={onClick}
                disabled={props.readonly}
            />
        )
    }),
)

const DialogEntry = memo(
    forwardRef<PluginRef, Plugin.SNSAdaptor.CompositionDialogEntryDialog & ExtraPluginProps>((props, ref) => {
        const { classes } = useStyles()
        const { dialog: Dialog, id, label, unstable, keepMounted, isOpenFromApplicationBoard } = props
        const [open, setOpen] = useState(false)
        const opener = useCallback(() => setOpen(true), [])
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
                        <PluginI18NFieldRender field={label} pluginID={id} />
                        {unstable && <Trans i18nKey="beta_sup" components={{ sup: <sup className={classes.sup} /> }} />}
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
                        <Dialog open={open} onClose={close} isOpenFromApplicationBoard={isOpenFromApplicationBoard} />
                    </span>
                </>
            )
        return chip
    }),
)
