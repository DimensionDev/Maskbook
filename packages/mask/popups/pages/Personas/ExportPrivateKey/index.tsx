import { memo, useCallback } from 'react'
import { useTitle } from '../../../hooks/index.js'
import { MaskSharedTrans } from '../../../../shared-ui/index.js'
import { Box, Button, Link, Typography, useTheme } from '@mui/material'

import { PersonaContext } from '@masknet/shared'
import Services from '#services'
import { useAsync, useCopyToClipboard } from 'react-use'
import { BottomController } from '../../../components/BottomController/index.js'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { ActionButton, usePopupCustomSnackbar } from '@masknet/theme'
import { Trans } from '@lingui/macro'

export const Component = memo(function ExportPrivateKey() {
    const theme = useTheme()
    const navigate = useNavigate()
    const { currentPersona } = PersonaContext.useContainer()

    const { showSnackbar } = usePopupCustomSnackbar()
    const [, copyToClipboard] = useCopyToClipboard()
    const { value } = useAsync(async () => {
        if (!currentPersona) return
        return Services.Backup.backupPersonaPrivateKey(currentPersona.identifier)
    }, [currentPersona])

    const handleBack = useCallback(() => {
        navigate(PopupRoutes.Personas, { replace: true })
    }, [])

    const handleCopy = useCallback(() => {
        if (!value) return
        copyToClipboard(value)

        showSnackbar(<Trans>Copied</Trans>)
    }, [value])

    useTitle(currentPersona?.nickname ?? '')

    return (
        <Box>
            <Box p={2} display="flex" flexDirection="column" rowGap={2}>
                <Typography fontWeight={700}>
                    <Trans>Private Key</Trans>
                </Typography>
                {value ?
                    <Typography
                        p={1.5}
                        style={{ background: theme.palette.maskColor.input, wordWrap: 'break-word', borderRadius: 8 }}>
                        {value}
                    </Typography>
                :   null}
                <Typography>
                    {/* eslint-disable-next-line react/naming-convention/component-name */}
                    <MaskSharedTrans.popups_export_private_key_tips
                        components={{
                            a: (
                                <Link
                                    onClick={() => {
                                        navigate(PopupRoutes.Settings)
                                    }}
                                />
                            ),
                        }}
                    />
                </Typography>
            </Box>
            <BottomController>
                <Button variant="outlined" fullWidth onClick={handleBack}>
                    <Trans>Back</Trans>
                </Button>
                <ActionButton onClick={handleCopy} fullWidth>
                    <Trans>Copy</Trans>
                </ActionButton>
            </BottomController>
        </Box>
    )
})
