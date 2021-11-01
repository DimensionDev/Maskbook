import { LoadingIcon } from '@masknet/icons'
import { FormattedAddress, ProviderIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { ProviderType } from '@masknet/web3-shared-evm'
import { Box, Stack, StackProps, Typography } from '@mui/material'
import { FC, memo } from 'react'
import { NetworkSelector } from '../../components/NetworkSelector'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => ({
    bar: {
        minWidth: 80,
        borderRadius: 30,
        lineHeight: '28px',
        height: '28px',
        cursor: 'pointer',
    },
    dot: {
        position: 'relative',
        top: 0,
        display: 'inline-block',
        marginRight: theme.spacing(0.8),
        lineHeight: '28px',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
}))

interface WalletStateBarUIProps extends StackProps {
    isPending: boolean
    providerType: ProviderType
    walletName: string
    walletAddress: string
    openConnectWalletDialog(): void
}

export const WalletStateBarUI: FC<WalletStateBarUIProps> = memo(
    ({ isPending, providerType, walletAddress, walletName, openConnectWalletDialog, children, ...rest }) => {
        const { t } = useI18N()
        const { classes } = useStyles()

        return (
            <Stack justifyContent="center" direction="row" alignItems="center" {...rest}>
                <NetworkSelector />
                {isPending && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ px: 2, color: '#ffb915', backgroundColor: 'rgba(255, 185, 21, 0.1)' }}
                        className={classes.bar}>
                        <LoadingIcon
                            sx={{ fontSize: 12, mr: 0.8, color: '#ffb915', backgroundColor: 'rgba(255, 185, 21, 0.1)' }}
                        />
                        <Typography component="span" fontSize={12} display="inline-block">
                            {t('popups_wallet_transactions_pending')}
                        </Typography>
                    </Stack>
                )}
                <Stack direction="row" onClick={openConnectWalletDialog} sx={{ cursor: 'pointer' }}>
                    <Stack mx={1} justifyContent="center">
                        <ProviderIcon providerType={providerType} />
                    </Stack>
                    <Box sx={{ userSelect: 'none' }}>
                        <Box fontSize={16}>{walletName}</Box>
                        <Box fontSize={12}>
                            <FormattedAddress address={walletAddress} size={10} />
                        </Box>
                    </Box>
                </Stack>
                {children}
            </Stack>
        )
    },
)
