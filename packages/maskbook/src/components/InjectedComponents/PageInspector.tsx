import { useSnackbar } from '@masknet/theme'
import { useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Close from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { useMatchXS, MaskMessage, useI18N } from '../../utils'
import type { PluginConfig } from '../../plugins/types'
import { PluginUI } from '../../plugins/PluginUI'
import { useAutoPasteFailedDialog } from './AutoPasteFailedDialog'
import { ErrorBoundary } from '../shared/ErrorBoundary'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => x.GlobalInjection)
export interface PageInspectorProps {}
export function PageInspector(props: PageInspectorProps) {
    const prompt = useSnackbar()
    const { t } = useI18N()
    const [autoPasteFailed, JSX] = useAutoPasteFailedDialog()
    const xsMatched = useMatchXS()
    useEffect(() =>
        MaskMessage.events.autoPasteFailed.on((data) => {
            const key = data.image ? Math.random() : data.text
            const close = () => prompt.closeSnackbar(key)
            const timeout = setTimeout(() => {
                prompt.closeSnackbar(key)
            }, 15 * 1000 /** 15 seconds */)
            prompt.enqueueSnackbar(t('auto_paste_failed_snackbar'), {
                variant: 'info',
                preventDuplicate: true,
                anchorOrigin: xsMatched
                    ? {
                          vertical: 'bottom',
                          horizontal: 'center',
                      }
                    : { horizontal: 'left', vertical: 'bottom' },
                key,
                action: (
                    <>
                        <Button color="inherit" onClick={() => [clearTimeout(timeout), close(), autoPasteFailed(data)]}>
                            {t('auto_paste_failed_snackbar_action')}
                        </Button>
                        <IconButton aria-label="Close" onClick={close}>
                            <Close />
                        </IconButton>
                    </>
                ),
            })
        }),
    )
    return (
        <>
            {JSX}
            <PluginRender />
            {[...PluginUI.values()].map((x) => (
                <ErrorBoundary subject={`Plugin "${x.pluginName}"`} key={x.identifier}>
                    <OldPluginPageInspectorForEach config={x} />
                </ErrorBoundary>
            ))}
        </>
    )
}

function OldPluginPageInspectorForEach({ config }: { config: PluginConfig }) {
    const F = config.PageComponent
    if (typeof F === 'function') return <F />
    return null
}
