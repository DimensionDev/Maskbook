import { useSnackbar } from 'notistack'
import React from 'react'
import { PluginUI, PluginConfig } from '../../plugins/plugin'
import { useMessage } from '../../utils/hooks/useMessage'
import { MessageCenter } from '../../utils/messages'
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
    useMessage(MessageCenter, 'autoPasteFailed', (data) => {
        const key = data.image ? Math.random() : data.text
        const close = () => prompt.closeSnackbar(key)
        prompt.enqueueSnackbar(t('auto_paste_failed_snackbar'), {
            variant: 'warning',
            preventDuplicate: true,
            persist: true,
            anchorOrigin: xsMatched
                ? {
                      vertical: 'bottom',
                      horizontal: 'center',
                  }
                : { horizontal: 'left', vertical: 'bottom' },
            key,
            action: (
                <>
                    <Button color="inherit" onClick={() => [close(), autoPasteFailed(data)]}>
                        {t('auto_paste_failed_snackbar_action')}
                    </Button>
                    <IconButton aria-label="Close" onClick={close}>
                        <Close />
                    </IconButton>
                </>
            ),
        })
    })
    return (
        <>
            {JSX}
            {[...PluginUI.values()].map((x) => (
                <ErrorBoundary key={x.identifier}>
                    <PluginPageInspectorForEach config={x} />
                </ErrorBoundary>
            ))}
        </>
    )
}

function PluginPageInspectorForEach({ config }: { config: PluginConfig }) {
    const F = config.pageInspector
    if (typeof F === 'function') return <F />
    return null
}
