import { ListItem, List, Typography, Link } from '@mui/material'
import { useERC721ContractSetApproveForAllCallback } from '@masknet/plugin-infra/web3-evm'
import { useState } from 'react'
import { TokenIcon } from '@masknet/shared'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
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

export function ApprovalNFTContent({ chainId }: { chainId: ChainId }) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { value: NFTList, loading } = useApprovedNFTList(account, chainId)
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
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
                <ApprovalNFTItem key={i} nft={nft} networkDescriptor={networkDescriptor} chainId={chainId} />
            ))}
        </List>
    )
}

interface ApprovalNFTItemProps {
    nft: NFTInfo
    networkDescriptor: NetworkDescriptor<ChainId, NetworkType>
    chainId: ChainId
}

function ApprovalNFTItem(props: ApprovalNFTItemProps) {
    const { networkDescriptor, nft, chainId } = props
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
        chainId,
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
        <div className={classes.listItemWrapper}>
            <ListItem className={classes.listItem}>
                <div className={classes.listItemInfo}>
                    <div>
                        <TokenIcon
                            address={nft.contract_id}
                            name={nft.contract_name}
                            logoURL={contractDetailed?.iconURL}
                            classes={{ icon: classes.logoIcon }}
                            isERC721
                        />

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

                <ChainBoundary
                    expectedChainId={chainId}
                    switchChainWithoutPopup
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    className={classes.chainBoundary}
                    classes={{ switchButton: classes.button }}
                    expectedChainIdSwitchedCallback={async () => {
                        await approveCallback()
                    }}
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
