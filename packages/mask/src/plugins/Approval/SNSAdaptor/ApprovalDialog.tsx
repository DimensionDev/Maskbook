import { DialogContent, ListItem, List, Typography, Link, Button } from '@mui/material'
import { TargetChainIdContext, useERC20TokenApproveCallback } from '@masknet/plugin-infra/web3-evm'
import BigNumber from 'bignumber.js'
import { useState, useMemo } from 'react'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import type { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import {
    useCurrentWeb3NetworkPluginID,
    useAccount,
    useWeb3State,
    useNetworkDescriptor,
} from '@masknet/plugin-infra/web3'
import { PluginId } from '@masknet/plugin-infra'
import { LinkOutIcon } from '@masknet/icons'
import { NetworkPluginID, NetworkDescriptor } from '@masknet/web3-shared-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useI18N } from '../locales'
import { InjectedDialog } from '@masknet/shared'
import { useStyles } from './useStyles'
import { useTokenApproved } from './hooks/useTokenApproved'
import { ApprovalLoadingContent } from './ApprovalLoadingContent'
import { ApprovalEmptyContent } from './ApprovalEmptyContent'
import type { Spender } from './types'

export interface ApprovalDialogProps {
    open: boolean
    onClose?: () => void
}

export function ApprovalDialog({ open, onClose }: ApprovalDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    enum Tabs {
        Tokens = 0,
        Collectibles = 1,
    }
    const [currentTab, setCurrentTab] = useState(Tabs.Tokens)
    const tabs = useMemo(
        () => [
            {
                label: t.tokens(),
                isActive: currentTab === Tabs.Tokens,
                clickHandler: () => setCurrentTab(Tabs.Tokens),
            },
            {
                label: t.collectibles(),
                isActive: currentTab === Tabs.Collectibles,
                clickHandler: () => setCurrentTab(Tabs.Collectibles),
            },
        ],
        [currentTab],
    )
    return (
        <TargetChainIdContext.Provider>
            <InjectedDialog
                open={open}
                title={t.plugin_name()}
                onClose={onClose}
                classes={{ paper: classes.dialogRoot, dialogTitle: classes.dialogTitle }}
                titleTabs={tabs}>
                <DialogContent className={classes.dialogContent}>
                    <ApprovalWrapper />
                </DialogContent>
            </InjectedDialog>
        </TargetChainIdContext.Provider>
    )
}

function ApprovalWrapper() {
    const { targetChainId: chainId, setTargetChainId } = TargetChainIdContext.useContainer()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const approvalDefinition = useActivatedPlugin(PluginId.Approval, 'any')
    const pluginId = useCurrentWeb3NetworkPluginID()
    const chainIdList = approvalDefinition?.enableRequirement.web3?.[pluginId]?.supportedChainIds ?? []
    const { classes } = useStyles()
    const { value: spenders, loading } = useTokenApproved(account, chainId)
    return (
        <div className={classes.approvalWrapper}>
            <div className={classes.abstractTabWrapper}>
                <NetworkTab
                    chainId={chainId}
                    setChainId={setTargetChainId}
                    classes={classes}
                    chains={chainIdList.filter(Boolean) as ChainId[]}
                />
            </div>
            {loading ? (
                <ApprovalLoadingContent />
            ) : !spenders || spenders.length === 0 ? (
                <ApprovalEmptyContent />
            ) : (
                <ApprovalTokenContent spenders={spenders} />
            )}
        </div>
    )
}

interface ApprovalTokenContentProps {
    spenders: Spender[]
}

function ApprovalTokenContent(props: ApprovalTokenContentProps) {
    const { spenders } = props
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM)
    const { classes } = useStyles({
        listItemBackground: networkDescriptor.backgroundGradient,
        listItemBackgroundIcon: `url("${networkDescriptor.icon}")`,
    })

    return (
        <List className={classes.approvalContentWrapper}>
            {spenders.map((spender, i) => (
                <ApprovalTokenItem key={i} spender={spender} networkDescriptor={networkDescriptor} />
            ))}
        </List>
    )
}

interface ApprovalTokenItemProps {
    spender: Spender
    networkDescriptor: NetworkDescriptor<ChainId, NetworkType>
}

function ApprovalTokenItem(props: ApprovalTokenItemProps) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { networkDescriptor, spender } = props
    const [approved, setApproved] = useState(false)
    const t = useI18N()
    const { classes, cx } = useStyles({
        listItemBackground: networkDescriptor.backgroundGradient,
        listItemBackgroundIcon: `url("${networkDescriptor.icon}")`,
    })
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const [_, transactionState, approveCallback] = useERC20TokenApproveCallback(
        spender.tokenInfo.id,
        '0',
        spender.id,
        () => setApproved(true),
    )

    return approved ? null : (
        <ListItem className={classes.listItem}>
            <div className={classes.listItemInfo}>
                <div>
                    <img src={spender.tokenInfo.logo_url} className={classes.logoIcon} />
                    <Typography className={classes.primaryText}>{spender.tokenInfo.symbol}</Typography>
                    <Typography className={classes.secondaryText}>{spender.tokenInfo.name}</Typography>
                </div>
                <div className={classes.contractInfo}>
                    <Typography className={classes.secondaryText}>{t.contract()}</Typography>
                    {!spender.logo ? null : typeof spender.logo === 'string' ? (
                        <img src={spender.logo} className={classes.spenderLogoIcon} />
                    ) : (
                        <div className={classes.spenderMaskLogoIcon}>{spender.logo}</div>
                    )}
                    <Typography className={classes.primaryText}>
                        {spender.name ?? Others?.formatAddress(spender.id, 4)}
                    </Typography>
                    <Link
                        className={classes.link}
                        href={Others?.explorerResolver.addressLink?.(chainId, spender.id) ?? ''}
                        target="_blank"
                        rel="noopener noreferrer">
                        <LinkOutIcon className={cx(classes.spenderLogoIcon, classes.linkOutIcon)} />
                    </Link>
                </div>
                <div>
                    <Typography className={classes.secondaryText}>{t.approved_amount()}</Typography>
                    <Typography className={classes.primaryText}>
                        {new BigNumber('1e+10').isLessThan(new BigNumber(spender.value)) ? t.infinite() : spender.value}
                    </Typography>
                </div>
            </div>

            <Button onClick={() => approveCallback(true, true)} disabled={transactionState.loadingApprove}>
                {transactionState.loadingApprove ? t.revoking() : t.revoke()}
            </Button>
        </ListItem>
    )
}
