import { memo } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { type ActionModalBaseProps, ActionModal } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { SelectProvider } from '../../components/SelectProvider/index.js'

export const SelectProviderModal = memo<ActionModalBaseProps>(function SelectProviderModal({ ...rest }) {
    const { t } = useI18N()
    const theme = useTheme()
    return (
        <ActionModal header={t('connect')} keepMounted {...rest}>
            <Typography
                textAlign="center"
                fontSize={14}
                fontWeight={700}
                lineHeight="18px"
                color={theme.palette.maskColor.third}>
                {t('popups_select_wallet_to_verify_tips')}
            </Typography>
            <Box mt={4}>
                <SelectProvider />
            </Box>
        </ActionModal>
    )
})
