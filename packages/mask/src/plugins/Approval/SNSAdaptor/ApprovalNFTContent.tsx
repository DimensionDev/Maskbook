import { useState } from 'react'
import { ListItem, List, Typography, Link } from '@mui/material'
import { useERC721ContractSetApproveForAllCallback } from '@masknet/plugin-infra/web3-evm'
import { TokenIcon } from '@masknet/shared'
import { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { ActionButton } from '@masknet/theme'
import {
    useAccount,
    useWeb3State,
    useNetworkDescriptor,
    useNonFungibleTokenContract,
    useWeb3Hub,
} from '@masknet/plugin-infra/web3'
import { NetworkPluginID, NetworkDescriptor, TokenType, NonFungibleContractSpender } from '@masknet/web3-shared-base'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary.js'
import { useI18N } from '../locales/index.js'
import { useStyles } from './useStyles.js'
import { ApprovalLoadingContent } from './ApprovalLoadingContent.js'
import { ApprovalEmptyContent } from './ApprovalEmptyContent.js'
import { useAsync } from 'react-use'

export function ApprovalNFTContent({ chainId }: { chainId: ChainId }) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const hub = useWeb3Hub(NetworkPluginID.PLUGIN_EVM)
    const { value: spenderList, loading } = useAsync(
        async () => hub?.getNonFungibleApprovedContracts?.(chainId, account),
        [chainId, account, hub],
    )

    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const { classes } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: networkDescriptor ? `url("${networkDescriptor?.icon}")` : undefined,
    })

    return loading ? (
        <ApprovalLoadingContent />
    ) : !spenderList || spenderList.length === 0 ? (
        <ApprovalEmptyContent />
    ) : (
        <List className={classes.approvalContentWrapper}>
            {spenderList.map((spender, i) => (
                <ApprovalNFTItem key={i} spender={spender} networkDescriptor={networkDescriptor} chainId={chainId} />
            ))}
        </List>
    )
}

interface ApprovalNFTItemProps {
    spender: NonFungibleContractSpender<ChainId, SchemaType>
    chainId: ChainId
    networkDescriptor?: NetworkDescriptor<ChainId, NetworkType>
}

function ApprovalNFTItem(props: ApprovalNFTItemProps) {
    const { networkDescriptor, spender, chainId } = props
    const [cancelled, setCancelled] = useState(false)
    const t = useI18N()
    const { classes, cx } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: `url("${networkDescriptor?.icon}")`,
    })
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

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
                            logoURL={contractDetailed?.iconURL}
                            classes={{ icon: classes.logoIcon }}
                            tokenType={TokenType.NonFungible}
                        />

                        {contractDetailed ? (
                            <Typography className={classes.primaryText}>{contractDetailed?.symbol}</Typography>
                        ) : null}
                        <Typography className={classes.secondaryText}>{spender.contract.name}</Typography>
                    </div>
                    <div className={classes.contractInfo}>
                        <Typography className={classes.secondaryText}>{t.contract()}</Typography>
                        {!spender.logo ? null : typeof spender.logo === 'string' ? (
                            <img src={spender.logo} className={classes.spenderLogoIcon} />
                        ) : (
                            <div className={classes.spenderMaskLogoIcon}>{spender.logo}</div>
                        )}
                        <Typography className={classes.primaryText}>
                            {spender.name ?? Others?.formatAddress(spender.address, 4)}
                        </Typography>
                        <Link
                            className={classes.link}
                            href={Others?.explorerResolver.addressLink?.(chainId, spender.address) ?? ''}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icons.LinkOut className={cx(classes.spenderLogoIcon, classes.linkOutIcon)} />
                        </Link>
                    </div>
                    <div>
                        <Typography className={classes.secondaryText}>{t.collection_approval()}</Typography>
                        <Typography className={classes.primaryText}>{spender.amount}</Typography>
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
