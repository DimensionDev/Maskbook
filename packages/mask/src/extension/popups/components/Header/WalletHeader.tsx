import { makeStyles } from '@masknet/theme'
import { memo, useMemo } from 'react'
import { Box, Link, MenuItem, Typography } from '@mui/material'
import type { ChainId, Wallet } from '@masknet/web3-shared-evm'
import { getRegisteredWeb3Networks, NetworkPluginID } from '@masknet/plugin-infra'
import { Flags } from '../../../../../shared'
import { ChainIcon, FormattedAddress, useMenuConfig, WalletIcon } from '@masknet/shared'
import { formatEthereumAddress, resolveAddressLinkOnExplorer } from '@masknet/web3-shared-evm'
import { CopyIconButton } from '../CopyIconButton'
import { useMatch, useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { ArrowDropIcon, MaskBlueIcon, PopupLinkIcon } from '@masknet/icons'

const useStyles = makeStyles()(() => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        padding: 16,
        lineHeight: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menu: {
        maxHeight: 466,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    action: {
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 99,
        padding: '5px 8px 5px 4px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    avatar: {
        marginRight: 4,
        width: 30,
        height: 30,
    },
    nickname: {
        color: '#07101B',
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    identifier: {
        fontSize: 10,
        color: '#767F8D',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        fontSize: 12,
        fill: '#767F8D',
        cursor: 'pointer',
        marginLeft: 4,
    },
    arrow: {
        fontSize: 20,
        transition: 'all 300ms',
    },
    colorChainICon: {
        borderRadius: '999px!important',
        margin: '0px !important',
    },
    networkSelector: {
        display: 'flex',
        cursor: 'pointer',
    },
    chainName: {
        fontSize: 14,
        lineHeight: '18px',
        color: '#15181B',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
    },
}))

export interface WalletHeaderProps {
    wallet: Wallet
    chainId: ChainId
    onChainChange: (chainId: ChainId) => void
}

export const WalletHeader = memo<WalletHeaderProps>(({ chainId, onChainChange, wallet }) => {
    const { classes } = useStyles()
    const networks = getRegisteredWeb3Networks()
    const matchSwitchWallet = useMatch(PopupRoutes.SwitchWallet)
    const navigate = useNavigate()
    const currentNetwork = useMemo(() => networks.find((x) => x.chainId === chainId) ?? networks[0], [networks])

    const [menu, openMenu, , status] = useMenuConfig(
        networks
            ?.filter((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM)
            .filter((x) => (Flags.support_testnet_switch ? true : x.isMainnet))
            .map((network) => {
                const chainId = network.chainId

                return (
                    <MenuItem
                        key={chainId}
                        onClick={() => onChainChange(chainId)}
                        selected={chainId === currentNetwork.chainId}>
                        {network.isMainnet ? (
                            <WalletIcon size={20} networkIcon={network.icon} />
                        ) : Flags.support_testnet_switch ? (
                            <ChainIcon color={network.iconColor} />
                        ) : null}
                        <Typography sx={{ marginLeft: 1 }}>{network.name}</Typography>
                    </MenuItem>
                )
            }) ?? [],
        {
            classes: { paper: classes.menu },
        },
    )

    return (
        <Box className={classes.container}>
            <div className={classes.networkSelector} onClick={openMenu}>
                {currentNetwork.isMainnet ? (
                    <WalletIcon networkIcon={currentNetwork.icon} size={30} />
                ) : (
                    <ChainIcon color={currentNetwork.iconColor} size={30} classes={{ point: classes.colorChainICon }} />
                )}
                <div style={{ marginLeft: 4 }}>
                    <Typography className={classes.chainName}>
                        {currentNetwork.name}
                        <ArrowDropIcon
                            className={classes.arrow}
                            style={{ transform: status ? 'rotate(-180deg)' : undefined }}
                        />
                    </Typography>
                </div>
            </div>
            <div
                className={classes.action}
                onClick={() => navigate(matchSwitchWallet ? PopupRoutes.Wallet : PopupRoutes.SwitchWallet)}>
                <MaskBlueIcon className={classes.avatar} />
                <div>
                    <Typography className={classes.nickname}>{wallet.name}</Typography>
                    <Typography className={classes.identifier}>
                        <FormattedAddress address={wallet.address} formatter={formatEthereumAddress} size={4} />
                        <CopyIconButton text={wallet.address ?? ''} className={classes.icon} />
                        <Link
                            onClick={(event) => event.stopPropagation()}
                            style={{ width: 12, height: 12 }}
                            href={resolveAddressLinkOnExplorer(chainId, wallet.address ?? '')}
                            target="_blank"
                            rel="noopener noreferrer">
                            <PopupLinkIcon className={classes.icon} />
                        </Link>
                    </Typography>
                </div>
                <ArrowDropIcon
                    className={classes.arrow}
                    style={{ transform: matchSwitchWallet ? 'rotate(-180deg)' : undefined }}
                />
            </div>
            {menu}
        </Box>
    )
})
