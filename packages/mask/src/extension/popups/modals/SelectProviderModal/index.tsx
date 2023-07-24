import { memo } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { type ActionModalBaseProps, ActionModal } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { SelectProvider } from '../../components/SelectProvider/index.js'
import { useSearchParams } from 'react-router-dom'

export const SelectProviderModal = memo<ActionModalBaseProps>(function SelectProviderModal({ ...rest }) {
    const { t } = useI18N()
    const theme = useTheme()
    const [params] = useSearchParams()
    const onlyMask = params.get('onlyMask')

    return (
        <ActionModal header={onlyMask ? t('connect_your_wallet') : t('connect')} keepMounted {...rest}>
            <Typography
                textAlign="center"
                fontSize={14}
                fontWeight={700}
                lineHeight="18px"
                color={theme.palette.maskColor.third}>
                {onlyMask ? t('popups_select_and_connect_wallet') : t('popups_select_wallet_to_verify_tips')}
            </Typography>
            <Box mt={4}>
                <SelectProvider />
            </Box>
        </ActionModal>
    )
})
