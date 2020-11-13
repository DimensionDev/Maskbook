import { useSnackbar } from 'notistack'
import React, { useEffect } from 'react'
import type { PluginConfig } from '../../plugins/types'
import { PluginUI } from '../../plugins/PluginUI'
import { MaskMessage } from '../../utils/messages'
import Button from '@material-ui/core/Button'
import Close from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import { useI18N } from '../../utils/i18n-next-ui'
import { useAutoPasteFailedDialog } from './AutoPasteFailedDialog'
import { useMatchXS } from '../../utils/hooks/useMatchXS'
import { ErrorBoundary } from '../shared/ErrorBoundary'

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
            {[...PluginUI.values()].map((x) => (
                <ErrorBoundary contain={`Plugin "${x.pluginName}"`} key={x.identifier}>
                    <PluginPageInspectorForEach config={x} />
                </ErrorBoundary>
            ))}
        </>
    )
}

function PluginPageInspectorForEach({ config }: { config: PluginConfig }) {
    const F = config.PageComponent
    if (typeof F === 'function') return <F />
    return null
}
