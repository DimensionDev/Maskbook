import { Trans } from '@lingui/react/macro'
import { createInjectHooksRenderer, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { MaskMessages } from '@masknet/shared-base'
import { useMatchXS } from '@masknet/shared-base-ui'
import { useSnackbar } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useAutoPasteFailedDialog } from './AutoPasteFailedDialog.js'

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
)

export function PageInspector() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
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
                enqueueSnackbar(
                    <>
                        <Typography color="textPrimary">
                            <Trans>Do you need to paste encrypted content manually?</Trans>
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
