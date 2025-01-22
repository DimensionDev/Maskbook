import { useState } from 'react'
import { ListItem, List, Typography, Link } from '@mui/material'
import { TokenIcon, ChainBoundary, LoadingStatus, EmptyStatus } from '@masknet/shared'
import { type ChainId, type NetworkType, SchemaType } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { ActionButton, makeStyles, parseColor } from '@masknet/theme'
import {
    useChainContext,
    useNetworkDescriptor,
    useNonFungibleTokenContract,
    useNonFungibleCollections,
} from '@masknet/web3-hooks-base'
import { EVMHub, EVMUtils } from '@masknet/web3-providers'
import { useERC721ContractSetApproveForAllCallback } from '@masknet/web3-hooks-evm'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import {
    TokenType,
    isSameAddress,
    type NetworkDescriptor,
    type NonFungibleContractSpender,
    type NonFungibleCollection,
} from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
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
            width: 80,
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

export function ApprovalNFTContent({ chainId }: { chainId: ChainId }) {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: spenders, isPending } = useQuery({
        queryKey: ['non-fungible-tokens', 'spenders', chainId, account],
        queryFn: async () => EVMHub.getNonFungibleTokenSpenders(chainId, account),
    })

    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const { classes } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: networkDescriptor ? `url("${networkDescriptor.icon}")` : undefined,
    })

    const { data: collections = EMPTY_LIST } = useNonFungibleCollections(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        account,
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
            {spenders.map((spender, i) => (
                <ApprovalNFTItem
                    key={i}
                    spender={spender}
                    networkDescriptor={networkDescriptor}
                    chainId={chainId}
                    collection={collections.find((x) => isSameAddress(x.address, spender.contract.address))}
                />
            ))}
        </List>
    )
}

interface ApprovalNFTItemProps {
    spender: NonFungibleContractSpender<ChainId, SchemaType>
    collection: NonFungibleCollection<ChainId, SchemaType> | undefined
    chainId: ChainId
    networkDescriptor?: NetworkDescriptor<ChainId, NetworkType>
}

function ApprovalNFTItem(props: ApprovalNFTItemProps) {
    const { networkDescriptor, spender, chainId, collection } = props
    const [cancelled, setCancelled] = useState(false)
    const { classes, cx } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: `url("${networkDescriptor?.icon}")`,
    })

    const [approveState, approveCallback] = useERC721ContractSetApproveForAllCallback(
        spender.contract.address,
        spender.address,
        false,
        () => setCancelled(true),
        chainId,
    )

    const { value: contractDetailed } = useNonFungibleTokenContract(
        NetworkPluginID.PLUGIN_EVM,
        spender.contract.address ?? '',
        SchemaType.ERC721,
        {
            chainId,
        },
    )

    return cancelled ? null : (
            <div className={classes.listItemWrapper}>
                <ListItem className={classes.listItem}>
                    <div className={classes.listItemInfo}>
                        <div className={classes.tokenRow}>
                            <TokenIcon
                                address={spender.contract.address}
                                name={spender.contract.name}
                                label=""
                                logoURL={collection?.iconURL ?? ''}
                                tokenType={TokenType.NonFungible}
                                size={18}
                                disableBadge
                            />

                            {contractDetailed ?
                                <Typography className={classes.primaryText}>
                                    {contractDetailed.symbol ||
                                        spender.contract.name ||
                                        contractDetailed.name ||
                                        collection?.name}
                                </Typography>
                            :   null}
                            <Typography className={classes.secondaryText}>
                                {spender.contract.name || contractDetailed?.name || collection?.name}
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
                                {spender.name ?? EVMUtils.formatAddress(spender.address, 4)}
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
                                <Trans>Collection Approval</Trans>
                            </Typography>
                            <Typography className={classes.primaryText}>
                                {collection?.balance ?? spender.amount}
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
                            onClick={approveCallback}
                            disabled={approveState.loading}
                            loading={approveState.loading}
                            className={classes.button}>
                            {approveState.loading ?
                                <Trans>Revoking</Trans>
                            :   <Trans>Revoke</Trans>}
                        </ActionButton>
                    </ChainBoundary>
                </ListItem>
            </div>
        )
}
