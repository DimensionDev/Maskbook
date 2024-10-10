import { useEffect } from 'react'
import { useCustomSnackbar } from '@masknet/theme'
import { Button, Box, Typography } from '@mui/material'
import { createInjectHooksRenderer, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { MaskMessages } from '@masknet/shared-base'
import { useMatchXS } from '@masknet/shared-base-ui'
import { useAutoPasteFailedDialog } from './AutoPasteFailedDialog.js'
import { Trans } from '@lingui/macro'

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
)

export function PageInspector() {
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
                        <Typography color="textPrimary">
                            <Trans>Do you need to paste encrypted content manually?</Trans>
                        </Typography>
                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                color="inherit"
                                variant="text"
                                onClick={() => [clearTimeout(timeout), close(), autoPasteFailed(data)]}>
                                <Trans>Show me how</Trans>
                            </Button>
                            <Button color="inherit" variant="text" aria-label="Close" onClick={close}>
                                <Trans>Close</Trans>
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
