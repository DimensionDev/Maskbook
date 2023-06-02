/// <reference types="react/next" />
import { unstable_useCacheRefresh, useContext } from 'react'
import { formatCount, formatPercentage, isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress, explorerResolver } from '@masknet/web3-shared-evm'
import { Badge, Box, Link, List, ListItem, Typography } from '@mui/material'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useI18N } from '../../../utils/index.js'
import { EthereumBlockie } from '@masknet/shared'
import { SnapshotContext } from '../context.js'
import { useVotes } from './hooks/useVotes.js'
import { useProposal } from './hooks/useProposal.js'
import { LoadingCard } from './LoadingCard.js'
import { LoadingFailCard } from './LoadingFailCard.js'
import { SnapshotCard } from './SnapshotCard.js'

const useStyles = makeStyles()((theme) => {
    return {
        list: {
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'var(--contentHeight)',
            overflow: 'auto',
            paddingTop: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        listItem: {
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.maskColor.publicLine}`,
            paddingLeft: 0,
            paddingRight: 0,
            gap: 16,
        },
        badge: {
            transform: 'translateX(50px) translateY(2.5px)',
        },
        avatarWrapper: {
            marginRight: 8,
        },
        choice: {
            flexGrow: 1,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: 170,
            color: theme.palette.maskColor.publicMain,
        },
        ellipsisText: {
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
        link: {
            display: 'flex',
            minWidth: 130,
            color: 'inherit',
            alignItems: 'center',
            textDecoration: 'none !important',
        },
        power: {
            minWidth: 90,
            color: theme.palette.maskColor.publicMain,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            maxWidth: 90,
        },
        shadowRootTooltip: {
            color: theme.palette.maskColor.white,
        },
        tooltip: {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: 'white',
        },
        arrow: {
            color: theme.palette.maskColor.publicMain,
        },
    }
})

function Content() {
    const { chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const identifier = useContext(SnapshotContext)
    const proposal = useProposal(identifier.id)
    const votes = useVotes(identifier, account)
    const { classes, cx, theme } = useStyles()
    const { t } = useI18N()
    return (
        <SnapshotCard
            lazy
            title={
                <Badge
                    max={9999999}
                    classes={{ badge: classes.badge }}
                    badgeContent={proposal.voterAmounts}
                    color="primary">
                    {t('plugin_snapshot_votes_title')}
                </Badge>
            }>
            <List className={classes.list}>
                {votes.map(function voteItemIter(v) {
                    const isAverageWeight = v.choices?.every((c) => c.weight === 1)
                    const fullChoiceText =
                        v.totalWeight && v.choices
                            ? v.choices
                                  .flatMap((choice, index) => [
                                      index === 0 ? '' : ', ',
                                      !isAverageWeight ? formatPercentage(choice.weight / v.totalWeight!) + ' ' : '',
                                      choice.name,
                                  ])
                                  .join('')
                            : null
                    return (
                        <ListItem className={classes.listItem} key={v.address}>
                            <Link
                                className={cx(classes.link, classes.ellipsisText)}
                                target="_blank"
                                rel="noopener"
                                href={explorerResolver.addressLink(chainId, v.address)}>
                                <Box className={classes.avatarWrapper}>
                                    <EthereumBlockie address={v.address} />
                                </Box>
                                <Typography color={theme.palette.maskColor.dark}>
                                    {isSameAddress(v.address, account)
                                        ? t('plugin_snapshot_votes_yourself')
                                        : formatEthereumAddress(v.address, 4)}
                                </Typography>
                            </Link>
                            {v.choice ? (
                                <Typography className={classes.choice}>{v.choice}</Typography>
                            ) : v.choices ? (
                                <ShadowRootTooltip
                                    PopperProps={{
                                        disablePortal: false,
                                    }}
                                    title={
                                        <Typography className={classes.shadowRootTooltip}>{fullChoiceText}</Typography>
                                    }
                                    placement="top"
                                    classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                    arrow>
                                    <Typography className={classes.choice}>{fullChoiceText}</Typography>
                                </ShadowRootTooltip>
                            ) : null}
                            <TextOverflowTooltip
                                as={ShadowRootTooltip}
                                PopperProps={{
                                    disablePortal: true,
                                }}
                                classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                title={
                                    <Typography className={classes.shadowRootTooltip}>
                                        {formatCount(v.balance, 2, true) +
                                            ' ' +
                                            (v.strategySymbol ? v.strategySymbol.toUpperCase() : '')}
                                    </Typography>
                                }
                                placement="top"
                                arrow>
                                <Typography className={classes.power}>
                                    {formatCount(v.balance, 2, true) +
                                        ' ' +
                                        (v.strategySymbol ? v.strategySymbol.toUpperCase() : '')}
                                </Typography>
                            </TextOverflowTooltip>
                        </ListItem>
                    )
                })}
            </List>
        </SnapshotCard>
    )
}

function Loading(props: React.PropsWithChildren<{}>) {
    const { t } = useI18N()
    return <LoadingCard title={t('plugin_snapshot_votes_title')}>{props.children}</LoadingCard>
}

function Fail(props: React.PropsWithChildren<{}>) {
    const { t } = useI18N()
    const retry = unstable_useCacheRefresh()
    return (
        <LoadingFailCard title={t('plugin_snapshot_votes_title')} retry={retry}>
            {props.children}
        </LoadingFailCard>
    )
}

export function VotesCard() {
    return (
        <Loading>
            <Fail>
                <Content />
            </Fail>
        </Loading>
    )
}
