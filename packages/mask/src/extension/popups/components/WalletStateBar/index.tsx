import { FC, memo } from 'react'
import { LoadingIcon } from '@masknet/icons'
import { FormattedAddress, WalletIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID, useProviderDescriptor } from '@masknet/plugin-infra'
import { formatEthereumAddress, formatEthereumEns, ProviderType } from '@masknet/web3-shared-evm'
import { Box, Stack, StackProps, Typography } from '@mui/material'
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
    walletName?: string
    walletAddress?: string
    domain?: string
    openConnectWalletDialog(): void
}

export const WalletStateBarUI: FC<WalletStateBarUIProps> = memo(
    ({ isPending, walletAddress, walletName, openConnectWalletDialog, children, domain, ...rest }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        const providerDescriptor = useProviderDescriptor(ProviderType.MaskWallet, NetworkPluginID.PLUGIN_EVM)

        if (!providerDescriptor) return null

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
                        <WalletIcon providerIcon={providerDescriptor.icon} inverse size={38} />
                    </Stack>
                    <Box sx={{ userSelect: 'none' }}>
                        <Box fontSize={16} display="flex" alignItems="center">
                            {walletName ?? '-'}
                            {domain ? (
                                <Typography fontSize={14} marginLeft={1}>
                                    {formatEthereumEns(domain)}
                                </Typography>
                            ) : null}
                        </Box>
                        <Box fontSize={12}>
                            <FormattedAddress
                                address={walletAddress ?? '-'}
                                size={10}
                                formatter={formatEthereumAddress}
                            />
                        </Box>
                    </Box>
                </Stack>
                {children}
            </Stack>
        )
    },
)
