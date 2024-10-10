/// <reference types="react/canary" />
import { unstable_useCacheRefresh, useContext } from 'react'
import { Badge, Box, Link, List, ListItem, Typography } from '@mui/material'
import { formatCount, formatPercentage, isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { EthereumBlockie } from '@masknet/shared'
import { SnapshotContext } from '../context.js'
import { useVotes } from './hooks/useVotes.js'
import { useProposal } from './hooks/useProposal.js'
import { LoadingCard } from './LoadingCard.js'
import { LoadingFailCard } from './LoadingFailCard.js'
import { SnapshotCard } from './SnapshotCard.js'
import { isArray } from 'lodash-es'
import { Trans } from '@lingui/macro'

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
    return (
        <SnapshotCard
            lazy
            title={
                <Badge
                    max={9999999}
                    classes={{ badge: classes.badge }}
                    badgeContent={proposal.voterAmounts}
                    color="primary">
                    <Trans>Votes</Trans>
                </Badge>
            }>
            <List className={classes.list}>
                {isArray(votes) &&
                    votes?.map(function voteItemIter(v) {
                        const isAverageWeight = v.choices?.every((c) => c.weight === 1)
                        const fullChoiceText =
                            v.totalWeight && v.choices ?
                                v.choices
                                    .flatMap((choice, index) => [
                                        index === 0 ? '' : ', ',
                                        !isAverageWeight ? formatPercentage(choice.weight / v.totalWeight!) + ' ' : '',
                                        choice.name,
                                    ])
                                    .join('')
                            :   null
                        return (
                            <ListItem className={classes.listItem} key={v.address}>
                                <Link
                                    className={cx(classes.link, classes.ellipsisText)}
                                    target="_blank"
                                    rel="noopener"
                                    href={EVMExplorerResolver.addressLink(chainId, v.address)}>
                                    <Box className={classes.avatarWrapper}>
                                        <EthereumBlockie address={v.address} />
                                    </Box>
                                    <Typography color={theme.palette.maskColor.dark}>
                                        {isSameAddress(v.address, account) ?
                                            <Trans>You</Trans>
                                        :   formatEthereumAddress(v.address, 4)}
                                    </Typography>
                                </Link>
                                {v.choice ?
                                    <Typography className={classes.choice}>{v.choice}</Typography>
                                : v.choices ?
                                    <ShadowRootTooltip
                                        PopperProps={{
                                            disablePortal: false,
                                        }}
                                        title={
                                            <Typography className={classes.shadowRootTooltip}>
                                                {fullChoiceText}
                                            </Typography>
                                        }
                                        placement="top"
                                        classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                        arrow>
                                        <Typography className={classes.choice}>{fullChoiceText}</Typography>
                                    </ShadowRootTooltip>
                                :   null}
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

function Loading(props: React.PropsWithChildren) {
    return <LoadingCard title={<Trans>Votes</Trans>}>{props.children}</LoadingCard>
}

function Fail(props: React.PropsWithChildren) {
    const retry = unstable_useCacheRefresh()
    return (
        <LoadingFailCard title={<Trans>Votes</Trans>} retry={retry}>
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
