import { Icons } from '@masknet/icons'
import { ChainIcon, CopyButton, FormattedAddress, ImageIcon, ProgressiveText } from '@masknet/shared'
import type { Wallet } from '@masknet/shared-base'
import { makeStyles, TextOverflowTooltip } from '@masknet/theme'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import type { ReasonableNetwork } from '@masknet/web3-shared-base'
import { formatEthereumAddress, type ChainId, type NetworkType, type SchemaType } from '@masknet/web3-shared-evm'
import { Box, Link, Typography } from '@mui/material'
import { memo, type MouseEvent } from 'react'
import { useMaskSharedTrans } from '../../../../../shared-ui/index.js'
import { useConnectedWallets } from '../../hooks/useConnected.js'
import { ActionGroup } from '../ActionGroup/index.js'
import { WalletAssetsValue } from './WalletAssetsValue.js'

const useStyles = makeStyles<{ disabled: boolean }>()((theme, { disabled }) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        container: {
            padding: '16px',
            lineHeight: 0,
            // padding bottom space for assets tabs
            paddingBottom: !disabled ? 34 : 16,
            background:
                isDark ?
                    theme.palette.maskColor.modalTitleBg
                :   'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        },
        topBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 38,
            gap: theme.spacing(1),
        },
        action: {
            background: theme.palette.maskColor.bg,
            borderRadius: 99,
            padding: '5px 8px 5px 4px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            maxWidth: '50%',
            boxShadow: `0px 4px 6px 0px ${isDark ? 'rgba(0, 0, 0, 0.10)' : 'rgba(102, 108, 135, 0.10)'}`,
            backdropFilter: 'blur(5px)',
        },
        nickname: {
            color: theme.palette.maskColor.main,
            lineHeight: '18px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        identifier: {
            fontSize: 10,
            color: theme.palette.maskColor.second,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
        },
        icon: {
            height: 12,
            width: 12,
            color: theme.palette.maskColor.second,
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
            overflow: 'auto',
        },
        chainName: {
            flexGrow: 1,
            lineHeight: '18px',
            color: theme.palette.maskColor.main,
            fontWeight: 700,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            maxWidth: 154,
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
    }
})
interface WalletHeaderUIProps {
    origin: string | null
    currentNetwork?: ReasonableNetwork<ChainId, SchemaType, NetworkType>
    chainId: ChainId
    onOpenNetworkSelector: (event: MouseEvent<HTMLDivElement>) => void
    onActionClick: () => void
    wallet: Wallet
    disabled?: boolean
    disableCopy?: boolean
}

export const WalletHeaderUI = memo<WalletHeaderUIProps>(function WalletHeaderUI({
    currentNetwork,
    chainId,
    onOpenNetworkSelector,
    onActionClick,
    wallet,
    disabled = false,
    disableCopy = false,
    origin,
}) {
    const t = useMaskSharedTrans()
    const { classes, cx } = useStyles({ disabled })
    const { data: connectedWallets, isPending } = useConnectedWallets(origin)
    const connected = connectedWallets?.has(wallet.address)
    const addressLink = EVMExplorerResolver.addressLink(chainId, wallet.address)

    const networkName = currentNetwork?.name || currentNetwork?.fullName
    return (
        <Box className={classes.container}>
            <div className={classes.topBar}>
                <div
                    className={classes.networkSelector}
                    onClick={(event) => {
                        if (!disabled && !wallet.owner) onOpenNetworkSelector(event)
                    }}>
                    {currentNetwork?.iconUrl ?
                        <ImageIcon size={30} icon={currentNetwork.iconUrl} name={currentNetwork.name || '?'} />
                    :   <ChainIcon size={30} color={currentNetwork?.color} name={currentNetwork?.name} />}

                    <Box ml={0.5} overflow="auto">
                        <Box overflow="auto" display="flex">
                            <TextOverflowTooltip title={networkName}>
                                <Typography className={classes.chainName} component="div">
                                    {networkName}
                                </Typography>
                            </TextOverflowTooltip>
                            {!disabled && !wallet.owner ?
                                <Icons.ArrowDrop
                                    size={20}
                                    className={classes.arrow}
                                    style={{ transform: status ? 'rotate(-180deg)' : undefined }}
                                />
                            :   null}
                        </Box>
                        {isPending ? null : (
                            <ProgressiveText className={classes.connected} loading={isPending} skeletonWidth={50}>
                                <span
                                    className={cx(
                                        classes.dot,
                                        connected ? classes.connectedDot : classes.unconnectedDot,
                                    )}
                                />
                                <span>
                                    {t.popups_wallet_connected_status({
                                        context: connected ? 'connected' : 'unconnected',
                                    })}
                                </span>
                            </ProgressiveText>
                        )}
                    </Box>
                </div>
                <div
                    className={classes.action}
                    onClick={() => {
                        if (!disabled) onActionClick()
                    }}>
                    {wallet.owner ?
                        <Icons.SmartPay size={30} />
                    :   <Icons.MaskBlue size={30} />}
                    <Box ml={0.5} overflow="hidden">
                        <TextOverflowTooltip title={wallet.name}>
                            <Typography className={classes.nickname}>{wallet.name}</Typography>
                        </TextOverflowTooltip>
                        <Typography className={classes.identifier}>
                            <FormattedAddress address={wallet.address} formatter={formatEthereumAddress} size={4} />
                            {!disableCopy ?
                                <CopyButton text={wallet.address} className={classes.icon} size={12} />
                            :   null}
                            {addressLink ?
                                <Link
                                    className={classes.icon}
                                    onClick={(event) => event.stopPropagation()}
                                    href={addressLink}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <Icons.PopupLink size={12} />
                                </Link>
                            :   null}
                        </Typography>
                    </Box>
                    {!disabled ?
                        <Icons.ArrowDrop className={classes.arrow} />
                    :   null}
                </div>
            </div>
            {!disabled ?
                <>
                    <WalletAssetsValue className={classes.balance} skeletonWidth={100} skeletonHeight="2em" />
                    <ActionGroup chainId={chainId} mt={2} />
                </>
            :   null}
        </Box>
    )
})
