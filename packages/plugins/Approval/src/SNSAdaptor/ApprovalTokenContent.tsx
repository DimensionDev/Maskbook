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
import { Others } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    type NetworkDescriptor,
    type FungibleTokenSpender,
    formatSpendingCap,
    formatBalance,
} from '@masknet/web3-shared-base'
import { ChainBoundary, TokenIcon } from '@masknet/shared'
import { useI18N } from '../locales/index.js'
import { ApprovalLoadingContent } from './ApprovalLoadingContent.js'
import { ApprovalEmptyContent } from './ApprovalEmptyContent.js'

export const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string } | void>()(
    (theme, props) => ({
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
        logoIcon: {
            borderRadius: 999,
            width: 18,
            height: 18,
            marginRight: '4px !important',
        },
        spenderLogoIcon: {
            width: 16,
            height: 16,
            marginRight: 4,
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
            marginRight: 4,
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
            alignItems: 'center',
        },
        primaryText: {
            fontSize: 14,
            fontWeight: 700,
            marginRight: 4,
            color: theme.palette.maskColor.dark,
        },
        secondaryText: {
            fontSize: 14,
            fontWeight: 400,
            marginRight: 4,
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
        isLoading,
        refetch,
    } = useFungibleTokenSpenders(NetworkPluginID.PLUGIN_EVM, { chainId, account })

    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const { classes } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: networkDescriptor ? `url("${networkDescriptor.icon}")` : undefined,
    })

    if (isLoading) return <ApprovalLoadingContent />

    if (!spenders || spenders.length === 0) return <ApprovalEmptyContent />

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

    const t = useI18N()
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
    const amount = spender.amount ? spender.amount : formatBalance(spender.rawAmount, token?.decimals)

    return (
        <div className={classes.listItemWrapper}>
            <ListItem className={classes.listItem}>
                <div className={classes.listItemInfo}>
                    <div>
                        <TokenIcon address={spender.tokenInfo.address} className={classes.logoIcon} />
                        <Typography className={classes.primaryText}>
                            {spender.tokenInfo.symbol || token?.symbol}
                        </Typography>
                        <Typography className={classes.secondaryText}>
                            {spender.tokenInfo.name || token?.name}
                        </Typography>
                    </div>
                    <div className={classes.contractInfo}>
                        <Typography className={classes.secondaryText}>{t.contract()}</Typography>
                        {!spender.logo ? null : typeof spender.logo === 'string' ? (
                            <img src={spender.logo} className={classes.spenderLogoIcon} />
                        ) : (
                            <div className={classes.spenderMaskLogoIcon}>{spender.logo ?? ''}</div>
                        )}
                        <Typography className={classes.primaryText}>
                            {spender.name || Others.formatAddress(spender.address, 4)}
                        </Typography>
                        <Link
                            className={classes.link}
                            href={Others.explorerResolver.addressLink(chainId, spender.address) ?? ''}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icons.LinkOut className={cx(classes.spenderLogoIcon, classes.linkOutIcon)} />
                        </Link>
                    </div>
                    <div>
                        <Typography className={classes.secondaryText}>{t.approved_amount()}</Typography>
                        <Typography className={classes.primaryText}>{formatSpendingCap(amount)}</Typography>
                    </div>
                </div>
                <ChainBoundary
                    expectedChainId={chainId}
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    className={classes.chainBoundary}
                    classes={{ switchButton: classes.button }}
                    ActionButtonPromiseProps={{
                        fullWidth: false,
                        init: t.revoke(),
                        startIcon: null,
                        failIcon: null,
                        waitingIcon: null,
                        className: classes.button,
                        failedButtonStyle: classes.button,
                        waiting: t.revoking(),
                        complete: t.revoke(),
                        failed: t.revoke(),
                    }}>
                    <ActionButton
                        onClick={() => approveCallback(true, true)}
                        disabled={transactionState.loadingApprove}
                        loading={transactionState.loadingApprove}
                        className={classes.button}>
                        {transactionState.loadingApprove ? t.revoking() : t.revoke()}
                    </ActionButton>
                </ChainBoundary>
            </ListItem>
        </div>
    )
}
