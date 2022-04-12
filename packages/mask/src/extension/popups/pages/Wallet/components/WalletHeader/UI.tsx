import { makeStyles } from '@masknet/theme'
import { memo, MouseEvent } from 'react'
import { Box, Link, Typography } from '@mui/material'
import { CopyIconButton } from '../../../../components/CopyIconButton'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { ChainIcon, FormattedAddress, WalletIcon } from '@masknet/shared'
import { ChainId, Wallet, formatEthereumAddress, resolveAddressLinkOnExplorer } from '@masknet/web3-shared-evm'
import { ArrowDropIcon, MaskBlueIcon, PopupLinkIcon } from '@masknet/icons'

const useStyles = makeStyles()(() => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        padding: '16px 11px',
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
interface WalletHeaderUIProps {
    currentNetwork: Web3Plugin.NetworkDescriptor
    chainId: ChainId
    onOpenNetworkSelector: (event: MouseEvent<HTMLDivElement>) => void
    onActionClick: () => void
    wallet: Wallet
    isSwitchWallet: boolean
}

export const WalletHeaderUI = memo<WalletHeaderUIProps>(
    ({ currentNetwork, chainId, onOpenNetworkSelector, onActionClick, wallet, isSwitchWallet }) => {
        const { classes } = useStyles()

        return (
            <Box className={classes.container}>
                <div className={classes.networkSelector} onClick={onOpenNetworkSelector}>
                    {currentNetwork.isMainnet ? (
                        <WalletIcon networkIcon={currentNetwork.icon} size={30} />
                    ) : (
                        <ChainIcon
                            color={currentNetwork.iconColor}
                            size={30}
                            classes={{ point: classes.colorChainICon }}
                        />
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
                <div className={classes.action} onClick={onActionClick}>
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
                        style={{ transform: isSwitchWallet ? 'rotate(-180deg)' : undefined }}
                    />
                </div>
            </Box>
        )
    },
)
