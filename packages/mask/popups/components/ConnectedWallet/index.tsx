import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { FormattedAddress, ProgressiveText } from '@masknet/shared'
import { NetworkPluginID, PopupModalRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { formatDomainName, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Link, Typography, useTheme } from '@mui/material'
import { memo } from 'react'
import { useModalNavigate } from '../ActionModal/index.js'
import { WalletAvatar } from '../WalletAvatar/index.js'

const useStyles = makeStyles()((theme) => ({
    walletList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
    },
    wallet: {
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        borderRadius: 16,
        '&:hover': {
            background: theme.palette.maskColor.bottom,
            boxShadow: theme.palette.maskColor.bottomBg,
        },
    },
    walletInfo: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 2,
        marginLeft: theme.spacing(0.75),
    },
    walletIcon: {
        boxShadow: '0px 4px 10px 0px rgba(0, 60, 216, 0.20)',
        borderRadius: 12,
    },
    walletName: {
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 100,
        overflow: 'hidden',
    },
    address: {
        fontSize: 12,
        fontWeight: 400,
        lineHeight: '16px',
        color: theme.palette.maskColor.second,
        display: 'flex',
        alignItems: 'center',
    },
    connect: {
        cursor: 'pointer',
        borderRadius: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.maskColor.bg,
        columnGap: 4,
        padding: '21px 0',
    },
}))

export const ConnectedWallet = memo(function ConnectedWallet() {
    const theme = useTheme()
    const { classes } = useStyles()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const localWallets = useWallets()
    const modalNavigate = useModalNavigate()
    const { NameService } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    return (
        <Box className={classes.walletList}>
            {localWallets.map((wallet, index) => {
                return (
                    <Box className={classes.wallet} key={index}>
                        <Box display="flex" alignItems="center">
                            <WalletAvatar size={24} className={classes.walletIcon} address={wallet.address} />
                            <Typography className={classes.walletInfo} component="div">
                                <ProgressiveText
                                    className={classes.walletName}
                                    component="span"
                                    skeletonWidth={60}
                                    skeletonHeight={16}
                                    loading={false}>
                                    {formatDomainName(wallet.name || '', 13)}
                                </ProgressiveText>

                                <Typography component="span" className={classes.address}>
                                    <FormattedAddress
                                        address={wallet.address}
                                        size={4}
                                        formatter={formatEthereumAddress}
                                    />
                                    <Link
                                        style={{ width: 14, height: 14, color: theme.palette.maskColor.main }}
                                        href={EVMExplorerResolver.addressLink(chainId, wallet.address ?? '')}
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <Icons.LinkOut size={14} sx={{ ml: 0.25 }} />
                                    </Link>
                                </Typography>
                            </Typography>
                        </Box>
                    </Box>
                )
            })}
            <Box className={classes.connect} onClick={() => modalNavigate(PopupModalRoutes.SelectProvider)}>
                <Icons.Connect size={16} />
                <Typography fontSize={12} fontWeight={700} lineHeight="16px">
                    <Trans>Connect</Trans>
                </Typography>
            </Box>
        </Box>
    )
})
