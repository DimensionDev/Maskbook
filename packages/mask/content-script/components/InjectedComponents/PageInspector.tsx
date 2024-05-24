import { useEffect } from 'react'
import { useCustomSnackbar } from '@masknet/theme'
import { Button, Box, Typography } from '@mui/material'
import { createInjectHooksRenderer, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { MaskMessages } from '@masknet/shared-base'
import { useMatchXS } from '@masknet/shared-base-ui'
import { useAutoPasteFailedDialog } from './AutoPasteFailedDialog.js'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
)

export function PageInspector() {
    const t = useMaskSharedTrans()
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const [autoPasteFailed, JSX] = useAutoPasteFailedDialog()
    const xsMatched = useMatchXS()

    useEffect(
        () =>
            MaskMessages.events.autoPasteFailed.on((data) => {
                const key = data.image ? Math.random() : data.text
                const close = () => {
                    closeSnackbar(key)
                }
                const timeout = setTimeout(close, 15 * 1000 /** 15 seconds */)
                showSnackbar(
                    <>
                        <Typography color="textPrimary">{t.auto_paste_failed_snackbar()}</Typography>
                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                color="inherit"
                                variant="text"
                                onClick={() => [clearTimeout(timeout), close(), autoPasteFailed(data)]}>
                                {t.auto_paste_failed_snackbar_action()}
                            </Button>
                            <Button color="inherit" variant="text" aria-label="Close" onClick={close}>
                                {t.auto_paste_failed_snackbar_action_close()}
                            </Button>
                        </Box>
                    </>,
                    {
                        variant: 'info',
                        preventDuplicate: true,
                        anchorOrigin:
                            xsMatched ?
                                {
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                }
                            :   { horizontal: 'right', vertical: 'top' },
                        key,
                    },
                )
            }),
        [],
    )
    return (
        <>
            {JSX}
            <GlobalInjection />
        </>
    )
}
