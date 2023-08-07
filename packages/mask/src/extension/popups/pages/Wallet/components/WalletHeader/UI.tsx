import { Icons } from '@masknet/icons'
import { ChainIcon, CopyButton, FormattedAddress, ImageIcon, ProgressiveText } from '@masknet/shared'
import type { Wallet } from '@masknet/shared-base'
import { makeStyles, TextOverflowTooltip } from '@masknet/theme'
import { ExplorerResolver } from '@masknet/web3-providers'
import type { ReasonableNetwork } from '@masknet/web3-shared-base'
import { formatEthereumAddress, type ChainId, type NetworkType, type SchemaType } from '@masknet/web3-shared-evm'
import { Box, Link, Typography } from '@mui/material'
import { memo, type MouseEvent } from 'react'
import { useI18N } from '../../../../../../utils/index.js'
import { useConnected } from '../../hooks/useConnected.js'
import { ActionGroup } from '../ActionGroup/index.js'
import { WalletAssetsValue } from './WalletAssetsValue.js'

const useStyles = makeStyles<{ disabled: boolean }>()((theme, { disabled }) => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        padding: '16px',
        // padding bottom space for assets tabs
        paddingBottom: !disabled ? 34 : 16,
        lineHeight: 0,
    },
    topbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 38,
        gap: theme.spacing(1),
    },
    action: {
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 99,
        padding: '5px 8px 5px 4px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        maxWidth: '50%',
    },
    nickname: {
        color: '#07101B',
        lineHeight: '18px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
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
        flexShrink: 0,
        color: theme.palette.maskColor.secondaryDark,
    },
    networkSelector: {
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        cursor: 'pointer',
    },
    chainName: {
        flexGrow: 1,
        lineHeight: '18px',
        color: '#15181B',
        fontWeight: 700,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
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
        display: 'inline-block',
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
    currentNetwork?: ReasonableNetwork<ChainId, SchemaType, NetworkType>
    chainId: ChainId
    onOpenNetworkSelector: (event: MouseEvent<HTMLDivElement>) => void
    onActionClick: () => void
    wallet: Wallet
    disabled?: boolean
}

export const WalletHeaderUI = memo<WalletHeaderUIProps>(function WalletHeaderUI({
    currentNetwork,
    chainId,
    onOpenNetworkSelector,
    onActionClick,
    wallet,
    disabled = false,
}) {
    const { t } = useI18N()
    const { classes, cx } = useStyles({ disabled })
    const { data, isLoading } = useConnected()
    const connected = data?.connected
    const addressLink = ExplorerResolver.addressLink(chainId, wallet.address)

    const networkName = currentNetwork?.name || currentNetwork?.fullName
    return (
        <Box className={classes.container}>
            <div className={classes.topbar}>
                <div
                    className={classes.networkSelector}
                    onClick={(event) => {
                        if (!disabled && !wallet.owner) onOpenNetworkSelector(event)
                    }}>
                    {currentNetwork?.iconUrl ? (
                        <ImageIcon size={30} icon={currentNetwork?.iconUrl} name={currentNetwork?.name || '?'} />
                    ) : (
                        <ChainIcon size={30} color={currentNetwork?.color} name={currentNetwork?.name} />
                    )}

                    <Box ml={0.5} overflow="auto">
                        <Box overflow="auto" display="flex">
                            <TextOverflowTooltip title={networkName}>
                                <Typography className={classes.chainName} component="div">
                                    {networkName}
                                </Typography>
                            </TextOverflowTooltip>
                            {!disabled && !wallet.owner ? (
                                <Icons.ArrowDrop
                                    size={20}
                                    className={classes.arrow}
                                    style={{ transform: status ? 'rotate(-180deg)' : undefined }}
                                />
                            ) : null}
                        </Box>
                        {data?.url || isLoading ? (
                            <ProgressiveText className={classes.connected} loading={isLoading}>
                                <span
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
                            </ProgressiveText>
                        ) : null}
                    </Box>
                </div>
                <div
                    className={classes.action}
                    onClick={() => {
                        if (!disabled) onActionClick()
                    }}>
                    {wallet.owner ? <Icons.SmartPay size={30} /> : <Icons.MaskBlue size={30} />}
                    <Box ml={0.5} overflow="hidden">
                        <TextOverflowTooltip title={wallet.name}>
                            <Typography className={classes.nickname}>{wallet.name}</Typography>
                        </TextOverflowTooltip>
                        <Typography className={classes.identifier}>
                            <FormattedAddress address={wallet.address} formatter={formatEthereumAddress} size={4} />
                            <CopyButton text={wallet.address} className={classes.icon} size={12} />
                            {addressLink ? (
                                <Link
                                    className={classes.icon}
                                    onClick={(event) => event.stopPropagation()}
                                    href={addressLink}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <Icons.PopupLink size={12} />
                                </Link>
                            ) : null}
                        </Typography>
                    </Box>
                    {!disabled ? <Icons.ArrowDrop className={classes.arrow} /> : null}
                </div>
            </div>
            {!disabled ? (
                <>
                    <WalletAssetsValue className={classes.balance} skeletonWidth={100} skeletonHeight="2em" />
                    <ActionGroup mt={2} />
                </>
            ) : null}
        </Box>
    )
})
