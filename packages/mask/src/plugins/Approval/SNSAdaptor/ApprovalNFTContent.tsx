import { ListItem, List, Typography, Avatar, Link, Button } from '@mui/material'
import { TargetChainIdContext, useERC721ContractSetApproveForAllCallback } from '@masknet/plugin-infra/web3-evm'
import { useState } from 'react'
import { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-evm'
import { LinkOutIcon } from '@masknet/icons'
import { useAccount, useWeb3State, useNetworkDescriptor, useNonFungibleTokenContract } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, NetworkDescriptor } from '@masknet/web3-shared-base'
import { useI18N } from '../locales'
import { useStyles } from './useStyles'
import { useApprovedNFTList } from './hooks/useApprovedNFTList'
import { ApprovalLoadingContent } from './ApprovalLoadingContent'
import { ApprovalEmptyContent } from './ApprovalEmptyContent'
import type { NFTInfo } from './types'

export function ApprovalNFTContent() {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { value: NFTList, loading } = useApprovedNFTList(account, chainId)
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM)
    const { classes } = useStyles({
        listItemBackground: networkDescriptor.backgroundGradient,
        listItemBackgroundIcon: `url("${networkDescriptor.icon}")`,
    })

    return loading ? (
        <ApprovalLoadingContent />
    ) : !NFTList || NFTList.length === 0 ? (
        <ApprovalEmptyContent />
    ) : (
        <List className={classes.approvalContentWrapper}>
            {NFTList.map((nft, i) => (
                <ApprovalNFTItem key={i} nft={nft} networkDescriptor={networkDescriptor} />
            ))}
        </List>
    )
}

interface ApprovalNFTItemProps {
    nft: NFTInfo
    networkDescriptor: NetworkDescriptor<ChainId, NetworkType>
}

function ApprovalNFTItem(props: ApprovalNFTItemProps) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { networkDescriptor, nft } = props
    const [cancelled, setCancelled] = useState(false)
    const t = useI18N()
    const { classes, cx } = useStyles({
        listItemBackground: networkDescriptor.backgroundGradient,
        listItemBackgroundIcon: `url("${networkDescriptor.icon}")`,
    })
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const [approveState, approveCallback] = useERC721ContractSetApproveForAllCallback(
        nft.contract_id,
        nft.spender.id,
        false,
        () => setCancelled(true),
    )

    const { value: contractDetailed } = useNonFungibleTokenContract(
        NetworkPluginID.PLUGIN_EVM,
        nft.contract_id ?? '',
        SchemaType.ERC721,
        {
            chainId,
        },
    )

    return cancelled ? null : (
        <ListItem className={classes.listItem}>
            <div className={classes.listItemInfo}>
                <div>
                    <Avatar className={classes.logoIcon} src={contractDetailed?.iconURL} />
                    {contractDetailed ? (
                        <Typography className={classes.primaryText}>{contractDetailed?.symbol}</Typography>
                    ) : null}
                    <Typography className={classes.secondaryText}>{nft.contract_name}</Typography>
                </div>
                <div className={classes.contractInfo}>
                    <Typography className={classes.secondaryText}>{t.contract()}</Typography>
                    {!nft.spender.logo ? null : typeof nft.spender.logo === 'string' ? (
                        <img src={nft.spender.logo} className={classes.spenderLogoIcon} />
                    ) : (
                        <div className={classes.spenderMaskLogoIcon}>{nft.spender.logo}</div>
                    )}
                    <Typography className={classes.primaryText}>
                        {nft.spender.name ?? Others?.formatAddress(nft.spender.id, 4)}
                    </Typography>
                    <Link
                        className={classes.link}
                        href={Others?.explorerResolver.addressLink?.(chainId, nft.spender.id) ?? ''}
                        target="_blank"
                        rel="noopener noreferrer">
                        <LinkOutIcon className={cx(classes.spenderLogoIcon, classes.linkOutIcon)} />
                    </Link>
                </div>
                <div>
                    <Typography className={classes.secondaryText}>{t.collection_approval()}</Typography>
                    <Typography className={classes.primaryText}>{nft.amount}</Typography>
                </div>
            </div>

            <Button onClick={approveCallback} disabled={approveState.loading}>
                {approveState.loading ? t.revoking() : t.revoke()}
            </Button>
        </ListItem>
    )
}
