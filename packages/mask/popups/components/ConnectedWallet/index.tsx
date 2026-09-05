import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { FormattedAddress } from '@masknet/shared'
import { type NetworkPluginID, PopupModalRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
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
            background: theme.vars.palette.maskColor.bottom,
            boxShadow: theme.vars.palette.maskColor.bottomBg,
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
    address: {
        fontSize: 12,
        fontWeight: 400,
        lineHeight: '16px',
        color: theme.vars.palette.maskColor.second,
        display: 'flex',
        alignItems: 'center',
    },
    connect: {
        cursor: 'pointer',
        borderRadius: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.vars.palette.maskColor.bg,
        columnGap: 4,
        padding: '21px 0',
    },
}))

export const ConnectedWallet = memo(function ConnectedWallet() {
    const theme = useTheme()
    const { classes } = useStyles()

    const { chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const modalNavigate = useModalNavigate()

    return (
        <Box className={classes.walletList}>
            {account ?
                <Box className={classes.wallet}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WalletAvatar size={24} className={classes.walletIcon} address={account} />
                        <Typography className={classes.walletInfo} component="div">
                            <Typography component="span" className={classes.address}>
                                <FormattedAddress address={account} size={4} formatter={formatEthereumAddress} />
                                <Link
                                    style={{ width: 14, height: 14, color: theme.vars.palette.maskColor.main }}
                                    href={EVMExplorerResolver.addressLink(chainId, account)}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <Icons.LinkOut size={14} sx={{ ml: 0.25 }} />
                                </Link>
                            </Typography>
                        </Typography>
                    </Box>
                </Box>
            :   null}
            <Box className={classes.connect} onClick={() => modalNavigate(PopupModalRoutes.SelectProvider)}>
                <Icons.Connect size={16} />
                <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: '16px' }}>
                    <Trans>Connect</Trans>
                </Typography>
            </Box>
        </Box>
    )
})
