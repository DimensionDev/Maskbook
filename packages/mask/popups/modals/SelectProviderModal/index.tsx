import { memo } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { type ActionModalBaseProps, ActionModal } from '../../components/index.js'
import { SelectProvider } from '../../components/SelectProvider/index.js'
import { useSearchParams } from 'react-router-dom'
import { Trans } from '@lingui/macro'

export const SelectProviderModal = memo<ActionModalBaseProps>(function SelectProviderModal(props) {
    const theme = useTheme()
    const [params] = useSearchParams()
    const onlyMask = params.get('onlyMask')

    return (
        <ActionModal
            header={onlyMask ? <Trans>Connect your wallet</Trans> : <Trans>Connect</Trans>}
            keepMounted
            {...props}>
            <Typography
                textAlign="center"
                fontSize={14}
                fontWeight={700}
                lineHeight="18px"
                color={theme.palette.maskColor.third}>
                {onlyMask ?
                    <Trans>Select and Connect to your wallet</Trans>
                :   <Trans>Connect Mask Network Account using your wallet.</Trans>}
            </Typography>
            <Box mt={4}>
                <SelectProvider />
            </Box>
        </ActionModal>
    )
})
