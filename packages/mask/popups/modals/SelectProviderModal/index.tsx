import { memo } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { type ActionModalBaseProps, ActionModal } from '../../components/index.js'
import { SelectProvider } from '../../components/SelectProvider/index.js'
import { Trans } from '@lingui/react/macro'

export const SelectProviderModal = memo<ActionModalBaseProps>(function SelectProviderModal(props) {
    const theme = useTheme()

    return (
        <ActionModal header={<Trans>Connect</Trans>} keepMounted {...props}>
            <Typography
                sx={{
                    color: theme.vars.palette.maskColor.third,
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: '18px',
                }}>
                <Trans>Connect Mask Network Account using your wallet.</Trans>
            </Typography>
            <Box sx={{ mt: 4 }}>
                <SelectProvider />
            </Box>
        </ActionModal>
    )
})
