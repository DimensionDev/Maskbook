import { useCustomSnackbar } from '@masknet/theme'
import { useEffect } from 'react'
import Button from '@mui/material/Button'
import Close from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { useMatchXS, MaskMessages, useI18N } from '../../utils'
import { useAutoPasteFailedDialog } from './AutoPasteFailedDialog'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => x.GlobalInjection)
export interface PageInspectorProps {}
export function PageInspector(props: PageInspectorProps) {
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const { t } = useI18N()
    const [autoPasteFailed, JSX] = useAutoPasteFailedDialog()
    const xsMatched = useMatchXS()
    useEffect(
        () =>
            MaskMessages.events.autoPasteFailed.on((data) => {
                const key = data.image ? Math.random() : data.text
                const close = () => closeSnackbar(key)
                const timeout = setTimeout(() => {
                    closeSnackbar(key)
                }, 15 * 1000 /** 15 seconds */)
                showSnackbar(t('auto_paste_failed_snackbar'), {
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
                            <Button
                                color="inherit"
                                onClick={() => [clearTimeout(timeout), close(), autoPasteFailed(data)]}>
                                {t('auto_paste_failed_snackbar_action')}
                            </Button>
                            <IconButton size="large" aria-label="Close" onClick={close}>
                                <Close />
                            </IconButton>
                        </>
                    ),
                })
            }),
        [],
    )
    return (
        <>
            {JSX}
            <PluginRender />
        </>
    )
}
