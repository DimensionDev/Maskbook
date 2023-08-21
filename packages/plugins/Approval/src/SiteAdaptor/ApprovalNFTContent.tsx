import { useState } from 'react'
import { useAsync } from 'react-use'
import { ListItem, List, Typography, Link } from '@mui/material'
import { TokenIcon, ChainBoundary } from '@masknet/shared'
import { type ChainId, type NetworkType, SchemaType } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { ActionButton, makeStyles, parseColor } from '@masknet/theme'
import {
    useChainContext,
    useNetworkDescriptor,
    useNonFungibleTokenContract,
    useNonFungibleCollections,
} from '@masknet/web3-hooks-base'
import { Hub, Others } from '@masknet/web3-providers'
import { useERC721ContractSetApproveForAllCallback } from '@masknet/web3-hooks-evm'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import {
    TokenType,
    isSameAddress,
    type NetworkDescriptor,
    type NonFungibleContractSpender,
    type NonFungibleCollection,
} from '@masknet/web3-shared-base'
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
    const { value: spenderList, loading } = useAsync(
        async () => Hub.getNonFungibleTokenSpenders(chainId, account),
        [chainId, account],
    )

    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const { classes } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: networkDescriptor ? `url("${networkDescriptor?.icon}")` : undefined,
    })

    const { data: collections = EMPTY_LIST } = useNonFungibleCollections(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        account,
    })

    if (loading) return <ApprovalLoadingContent />

    if (!spenderList || spenderList.length === 0) return <ApprovalEmptyContent />

    return (
        <List className={classes.approvalContentWrapper}>
            {spenderList.map((spender, i) => (
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
    const t = useI18N()
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
                    <div>
                        <TokenIcon
                            address={spender.contract.address}
                            name={spender.contract.name}
                            label=""
                            logoURL={collection?.iconURL ?? ''}
                            className={classes.logoIcon}
                            tokenType={TokenType.NonFungible}
                        />

                        {contractDetailed ? (
                            <Typography className={classes.primaryText}>
                                {contractDetailed?.symbol ||
                                    spender.contract.name ||
                                    contractDetailed?.name ||
                                    collection?.name}
                            </Typography>
                        ) : null}
                        <Typography className={classes.secondaryText}>
                            {spender.contract.name || contractDetailed?.name || collection?.name}
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
                            {spender.name ?? Others.formatAddress(spender.address, 4)}
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
                        <Typography className={classes.secondaryText}>{t.collection_approval()}</Typography>
                        <Typography className={classes.primaryText}>{collection?.balance ?? spender.amount}</Typography>
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
                        onClick={approveCallback}
                        disabled={approveState.loading}
                        loading={approveState.loading}
                        className={classes.button}>
                        {approveState.loading ? t.revoking() : t.revoke()}
                    </ActionButton>
                </ChainBoundary>
            </ListItem>
        </div>
    )
}
