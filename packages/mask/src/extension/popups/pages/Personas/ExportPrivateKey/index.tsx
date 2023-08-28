import { memo, useCallback } from 'react'
import { useTitle } from '../../../hooks/index.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { Box, Button, Link, Typography, useTheme } from '@mui/material'

import { PersonaContext } from '@masknet/shared'
import Services from '../../../../service.js'
import { useAsync, useCopyToClipboard } from 'react-use'
import { Trans } from 'react-i18next'
import { BottomController } from '../../../components/BottomController/index.js'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, usePopupCustomSnackbar } from '@masknet/theme'

const ExportPrivateKey = memo(function ExportPrivateKey() {
    const { t } = useI18N()
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

        showSnackbar(t('copied'))
    }, [value])

    useTitle(currentPersona?.nickname ?? '')

    return (
        <Box>
            <Box p={2} display="flex" flexDirection="column" rowGap={2}>
                <Typography fontWeight={700}>{t('popups_wallet_backup_private_key')}</Typography>
                {value ? (
                    <Typography
                        p={1.5}
                        style={{ background: theme.palette.maskColor.input, wordWrap: 'break-word', borderRadius: 8 }}>
                        {value}
                    </Typography>
                ) : null}
                <Typography>
                    <Trans
                        i18nKey="popups_export_private_key_tips"
                        components={{
                            a: (
                                <Link
                                    onClick={() => {
                                        browser.tabs.create({
                                            active: true,
                                            url: browser.runtime.getURL(
                                                `/dashboard.html#${DashboardRoutes.Settings}?mode=true`,
                                            ),
                                        })
                                    }}
                                />
                            ),
                        }}
                    />
                </Typography>
            </Box>
            <BottomController>
                <Button variant="outlined" fullWidth onClick={handleBack}>
                    {t('back')}
                </Button>
                <ActionButton onClick={handleCopy} fullWidth>
                    {t('copy')}
                </ActionButton>
            </BottomController>
        </Box>
    )
})

export default ExportPrivateKey
