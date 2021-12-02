import {
    useActivatedPluginSNSAdaptor_withSupportOperateChain,
    useActivatedPluginsSNSAdaptor,
    Plugin,
} from '@masknet/plugin-infra'
import { ErrorBoundary } from '@masknet/shared'
import { Result } from 'ts-results'
import { PluginI18NFieldRender, usePluginI18NField } from '../../plugin-infra/I18NFieldRender'
import { RedPacketPluginID } from '../../plugins/RedPacket/constants'
import { ITO_PluginID } from '../../plugins/ITO/constants'
import { ClickableChip } from '../shared/SelectRecipients/ClickableChip'
import { makeStyles } from '@masknet/theme'
import { useCallback, useState, useRef, forwardRef, memo, useImperativeHandle } from 'react'
import { useChainId } from '@masknet/web3-shared-evm'
import { Trans } from 'react-i18next'
const useStyles = makeStyles()({
    sup: {
        paddingLeft: 2,
    },
})
export interface PluginEntryRenderRef {
    openPlugin(id: string): void
}
export const PluginEntryRender = memo(
    forwardRef<PluginEntryRenderRef, { readonly: boolean }>((props, ref) => {
        const [trackPluginRef] = useSetPluginEntryRenderRef(ref)
        const pluginField = usePluginI18NField()
        const chainId = useChainId()
        const operatingSupportedChainMapping = useActivatedPluginSNSAdaptor_withSupportOperateChain(chainId)
        const result = [...useActivatedPluginsSNSAdaptor()]
            .sort((plugin) => {
                // TODO: support priority order
                if (plugin.ID === RedPacketPluginID || plugin.ID === ITO_PluginID) return -1
                return 1
            })
            .map((plugin) =>
                Result.wrap(() => {
                    const entry = plugin.CompositionDialogEntry
                    const unstable = plugin.enableRequirement.target !== 'stable'
                    const ID = plugin.ID
                    if (!entry || !operatingSupportedChainMapping[ID]) return null
                    const extra: ExtraPluginProps = { unstable, id: ID, readonly: props.readonly }
                    return (
                        <ErrorBoundary subject={`Plugin "${pluginField(ID, plugin.name)}"`} key={plugin.ID}>
                            {'onClick' in entry ? (
                                <CustomEntry {...entry} {...extra} ref={trackPluginRef(ID)} />
                            ) : (
                                <DialogEntry {...entry} {...extra} ref={trackPluginRef(ID)} />
                            )}
                        </ErrorBoundary>
                    )
                }).unwrapOr(null),
            )
        return <>{result}</>
    }),
)

function useSetPluginEntryRenderRef(ref: React.ForwardedRef<PluginEntryRenderRef>) {
    const pluginRefs = useRef<Record<string, PluginRef | undefined | null>>({})
    useImperativeHandle(
        ref,
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
    const trackPluginRef = (pluginID: string) => (ref: PluginRef | null) => {
        pluginRefs.current = { ...pluginRefs.current, [pluginID]: ref }
    }
    return [trackPluginRef]
}
function useSetPluginRef(ref: React.ForwardedRef<PluginRef>, onClick: () => void) {
    useImperativeHandle(ref, () => ({ open: onClick }), [onClick])
}

type PluginRef = { open(): void }
type ExtraPluginProps = { unstable: boolean; id: string; readonly: boolean }
const CustomEntry = memo(
    forwardRef<PluginRef, Plugin.SNSAdaptor.CompositionDialogEntryCustom & ExtraPluginProps>((props, ref) => {
        const { classes } = useStyles()
        const { id, label, onClick, unstable } = props
        useSetPluginRef(ref, onClick)
        return (
            <ClickableChip
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
        const { dialog: Dialog, id, label, unstable, keepMounted } = props
        const [open, setOpen] = useState(false)
        const opener = useCallback(() => setOpen(true), [])
        const close = useCallback(() => setOpen(false), [])
        useSetPluginRef(ref, opener)
        const chip = (
            <ClickableChip
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
                        <Dialog open={open} onClose={close} />
                    </span>
                </>
            )
        return chip
    }),
)
