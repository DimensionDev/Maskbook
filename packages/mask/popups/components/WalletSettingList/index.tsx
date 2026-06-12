import { Icons } from '@masknet/icons'
import { PopupRoutes } from '@masknet/shared-base'
import { PopupHomeTabType } from '@masknet/shared'
import { useTheme, Typography, Box } from '@mui/material'
import { memo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import urlcat from 'urlcat'
import { Trans } from '@lingui/react/macro'

export const WalletList = memo(function WalletList() {
    const theme = useTheme()
    return (
        <Box flex={1} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Icons.EmptySimple size={36} />
            <Typography fontSize={14} color={theme.palette.maskColor.second} mt={1.5} textAlign="center">
                <Trans>
                    No associated wallet.{' '}
                    <RouterLink
                        to={urlcat(PopupRoutes.Personas, { tab: PopupHomeTabType.ConnectedWallets })}
                        style={{ display: 'block', color: theme.palette.maskColor.main, cursor: 'pointer' }}>
                        Add Wallet.
                    </RouterLink>
                </Trans>
            </Typography>
        </Box>
    )
})
