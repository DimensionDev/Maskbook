import { memo, type MouseEvent } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Link, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import type { Wallet } from '@masknet/shared-base'
import { CopyButton, FormattedAddress, ImageIcon } from '@masknet/shared'
import { type ChainId, formatEthereumAddress, explorerResolver, type NetworkType } from '@masknet/web3-shared-evm'
import type { NetworkDescriptor } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../../../utils/index.js'
import { ActionGroup } from '../ActionGroup/index.js'
import { WalletAssetsValue } from './WalletAssetsValue.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        padding: '16px',
        // padding bottom space for assets tabs
        paddingBottom: 34,
        lineHeight: 0,
    },
    topbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    action: {
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 99,
        padding: '5px 8px 5px 4px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    nickname: {
        color: '#07101B',
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
        height: 12,
        width: 12,
        color: '#767F8D',
        cursor: 'pointer',
        marginLeft: 4,
    },
    arrow: {
        fontSize: 20,
        transition: 'all 300ms',
        color: theme.palette.maskColor.secondaryDark,
    },
    networkSelector: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    chainName: {
        lineHeight: '18px',
        color: '#15181B',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
    },
    connected: {
        display: 'flex',
        alignItems: 'center',
        lineHeight: '18px',
        fontSize: 12,
        color: theme.palette.maskColor.second,
        columnGap: 4,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 99,
    },
    connectedDot: {
        backgroundColor: theme.palette.maskColor.success,
    },
    unconnectedDot: {
        backgroundColor: theme.palette.maskColor.third,
    },
    balance: {
        fontSize: 36,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        height: 54,
        paddingTop: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(2),
    },
}))
interface WalletHeaderUIProps {
    currentNetwork: NetworkDescriptor<ChainId, NetworkType>
    chainId: ChainId
    onOpenNetworkSelector: (event: MouseEvent<HTMLDivElement>) => void
    onActionClick: () => void
    wallet: Wallet
    disabled?: boolean
    connected?: boolean
    hiddenConnected?: boolean
}

export const WalletHeaderUI = memo<WalletHeaderUIProps>(function WalletHeaderUI({
    currentNetwork,
    chainId,
    onOpenNetworkSelector,
    onActionClick,
    wallet,
    disabled,
    connected,
    hiddenConnected,
}) {
    const { t } = useI18N()
    const { classes, cx } = useStyles()

    return (
        <Box className={classes.container}>
            <div className={classes.topbar}>
                <div
                    className={classes.networkSelector}
                    onClick={(event) => {
                        if (!disabled && !wallet.owner) onOpenNetworkSelector(event)
                    }}>
                    <ImageIcon size={30} icon={currentNetwork.icon} name={currentNetwork.name} />

                    <div style={{ marginLeft: 4 }}>
                        <Typography className={classes.chainName}>
                            {currentNetwork.name}
                            {!disabled && !wallet.owner ? (
                                <Icons.ArrowDrop
                                    className={classes.arrow}
                                    style={{ transform: status ? 'rotate(-180deg)' : undefined }}
                                />
                            ) : null}
                        </Typography>
                        {!hiddenConnected ? (
                            <Typography className={classes.connected} component="div">
                                <div
                                    className={cx(
                                        classes.dot,
                                        connected ? classes.connectedDot : classes.unconnectedDot,
                                    )}
                                />
                                <span>
                                    {t('popups_wallet_connected_status', {
                                        context: connected ? 'connected' : 'unconnected',
                                    })}
                                </span>
                            </Typography>
                        ) : null}
                    </div>
                </div>
                <div
                    className={classes.action}
                    onClick={() => {
                        if (!disabled) onActionClick()
                    }}>
                    {wallet.owner ? <Icons.SmartPay size={30} /> : <Icons.MaskBlue size={30} />}
                    <Box ml={0.5}>
                        <Typography className={classes.nickname}>{wallet.name}</Typography>
                        <Typography className={classes.identifier}>
                            <FormattedAddress address={wallet.address} formatter={formatEthereumAddress} size={4} />
                            <CopyButton text={wallet.address} className={classes.icon} size={12} />
                            <Link
                                onClick={(event) => event.stopPropagation()}
                                style={{ width: 12, height: 12 }}
                                href={explorerResolver.addressLink(chainId, wallet.address ?? '')}
                                target="_blank"
                                rel="noopener noreferrer">
                                <Icons.PopupLink className={classes.icon} />
                            </Link>
                        </Typography>
                    </Box>
                    {!disabled ? <Icons.ArrowDrop className={classes.arrow} /> : null}
                </div>
            </div>
            <WalletAssetsValue className={classes.balance} skeletonWidth={100} skeletonHeight="2em" />
            <ActionGroup mt={2} />
        </Box>
    )
})
