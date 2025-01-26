import { ListItem, List, Typography, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { ActionButton, makeStyles, parseColor } from '@masknet/theme'
import type { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-evm'
import { useERC20TokenApproveCallback } from '@masknet/web3-hooks-evm'
import {
    useChainContext,
    useNetworkDescriptor,
    useFungibleTokenSpenders,
    useFungibleToken,
} from '@masknet/web3-hooks-base'
import { EVMUtils } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    type NetworkDescriptor,
    type FungibleTokenSpender,
    formatSpendingCap,
    leftShift,
} from '@masknet/web3-shared-base'
import { ChainBoundary, EmptyStatus, LoadingStatus, TokenIcon } from '@masknet/shared'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string } | void>()(
    (theme, props) => ({
        statusBox: {
            height: '100%',
            boxSizing: 'border-box',
        },
        approvalContentWrapper: {
            flexGrow: 1,
            width: 565,
            paddingTop: 8,
            marginLeft: 16,
            display: 'flex',
            flexDirection: 'column',
        },
        listItemWrapper: {
            width: '100%',
            height: 90,
            padding: 0,
            marginTop: 4,
            background: theme.palette.common.white,
            borderRadius: 8,
            marginBottom: theme.spacing(1),
        },
        listItem: {
            width: '100%',
            height: 90,
            padding: 12,
            borderRadius: 8,
            marginBottom: 0,
            background: props?.listItemBackground ?? theme.palette.background.default,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:before': {
                position: 'absolute',
                content: '""',
                top: 30,
                left: 381,
                zIndex: 0,
                width: 114,
                opacity: 0.2,
                height: 61,
                filter: 'blur(1.5px)',
                background: props?.listItemBackgroundIcon,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '114px 114px',
            },
        },
        listItemInfo: {
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
            '& > div': {
                display: 'flex',
            },
        },
        tokenRow: {
            display: 'flex',
            gap: 4,
        },
        spenderLogoIcon: {
            width: 16,
            height: 16,
        },
        link: {
            width: 16,
            height: 16,
        },
        linkOutIcon: {
            color: theme.palette.maskColor.secondaryDark,
            marginLeft: 2,
        },
        spenderMaskLogoIcon: {
            display: 'inline-block',
            width: 16,
            height: 16,
            '& > svg': {
                width: 16,
                height: 16,
            },
            '& > span': {
                width: 16,
                height: 16,
            },
        },
        contractInfo: {
            display: 'flex',
            gap: 4,
            alignItems: 'center',
        },
        primaryText: {
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.maskColor.dark,
        },
        secondaryText: {
            fontSize: 14,
            fontWeight: 400,
            color: theme.palette.maskColor.secondaryDark,
        },
        button: {
            minWidth: 80,
            height: 32,
            fontSize: 12,
            color: theme.palette.common.white,
            background: theme.palette.common.black,
            flex: 'initial !important',
            '&:disabled': {
                color: theme.palette.common.white,
                background: theme.palette.common.black,
            },
            '&:hover': {
                color: theme.palette.common.white,
                background: theme.palette.common.black,
                boxShadow: `0 8px 25px ${parseColor(theme.palette.common.black).setAlpha(0.3).toRgbString()}`,
            },
        },
        chainBoundary: {
            width: 'auto !important',
        },
    }),
)

export function ApprovalTokenContent({ chainId }: { chainId: ChainId }) {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const {
        data: spenders,
        isPending,
        refetch,
    } = useFungibleTokenSpenders(NetworkPluginID.PLUGIN_EVM, { chainId, account })

    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const { classes } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: networkDescriptor ? `url("${networkDescriptor.icon}")` : undefined,
    })

    if (isPending) return <LoadingStatus iconSize={36} className={classes.statusBox} />

    if (!spenders || spenders.length === 0)
        return (
            <EmptyStatus iconSize={36} className={classes.statusBox}>
                <Trans>No approved contract records.</Trans>
            </EmptyStatus>
        )

    return (
        <List className={classes.approvalContentWrapper}>
            {spenders.map((spender) => (
                <ApprovalTokenItem
                    key={`${spender.address}.${spender.tokenInfo.address}`}
                    spender={spender}
                    networkDescriptor={networkDescriptor}
                    chainId={chainId}
                    retry={refetch}
                />
            ))}
        </List>
    )
}

interface ApprovalTokenItemProps {
    chainId: ChainId
    spender: FungibleTokenSpender<ChainId, SchemaType>
    networkDescriptor?: NetworkDescriptor<ChainId, NetworkType>
    retry: () => void
}

function ApprovalTokenItem(props: ApprovalTokenItemProps) {
    const { networkDescriptor, spender, chainId, retry } = props
    const { classes, cx } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: `url("${networkDescriptor?.icon}")`,
    })

    const [_, transactionState, approveCallback] = useERC20TokenApproveCallback(
        spender.tokenInfo.address,
        '0',
        spender.address,
        retry,
        chainId,
    )

    const { data: token } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, spender.tokenInfo.address, undefined, {
        chainId,
    })
    const amount =
        spender.amount ? spender.amount
        : spender.rawAmount ? leftShift(spender.rawAmount, token?.decimals)
        : undefined

    return (
        <div className={classes.listItemWrapper}>
            <ListItem className={classes.listItem}>
                <div className={classes.listItemInfo}>
                    <div className={classes.tokenRow}>
                        <TokenIcon address={spender.tokenInfo.address} chainId={chainId} size={18} disableBadge />
                        <Typography className={classes.primaryText}>
                            {spender.tokenInfo.symbol || token?.symbol}
                        </Typography>
                        <Typography className={classes.secondaryText}>
                            {spender.tokenInfo.name || token?.name}
                        </Typography>
                    </div>
                    <div className={classes.contractInfo}>
                        <Typography className={classes.secondaryText}>
                            <Trans>Contract</Trans>
                        </Typography>
                        {!spender.logo ?
                            null
                        : typeof spender.logo === 'string' ?
                            <img src={spender.logo} className={classes.spenderLogoIcon} />
                        :   <div className={classes.spenderMaskLogoIcon}>{spender.logo ?? ''}</div>}
                        <Typography className={classes.primaryText}>
                            {spender.name || EVMUtils.formatAddress(spender.address, 4)}
                        </Typography>
                        <Link
                            className={classes.link}
                            href={EVMUtils.explorerResolver.addressLink(chainId, spender.address) ?? ''}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icons.LinkOut className={cx(classes.spenderLogoIcon, classes.linkOutIcon)} />
                        </Link>
                    </div>
                    <div>
                        <Typography className={classes.secondaryText}>
                            <Trans>
                                Approved Amount{' '}
                                {amount ?
                                    <Typography component="span" className={classes.primaryText}>
                                        {formatSpendingCap(amount)}
                                    </Typography>
                                :   null}
                            </Trans>
                        </Typography>
                    </div>
                </div>
                <ChainBoundary
                    expectedChainId={chainId}
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    className={classes.chainBoundary}
                    classes={{ switchButton: classes.button }}
                    ActionButtonPromiseProps={{
                        fullWidth: false,
                        init: <Trans>Revoke</Trans>,
                        startIcon: null,
                        failIcon: null,
                        waitingIcon: null,
                        className: classes.button,
                        failedButtonStyle: classes.button,
                        waiting: <Trans>Revoking</Trans>,
                        complete: <Trans>Revoke</Trans>,
                        failed: <Trans>Revoke</Trans>,
                    }}>
                    <ActionButton
                        onClick={() => approveCallback(true, true)}
                        disabled={transactionState.loadingApprove}
                        loading={transactionState.loadingApprove}
                        className={classes.button}>
                        {transactionState.loadingApprove ?
                            <Trans>Revoking</Trans>
                        :   <Trans>Revoke</Trans>}
                    </ActionButton>
                </ChainBoundary>
            </ListItem>
        </div>
    )
}
