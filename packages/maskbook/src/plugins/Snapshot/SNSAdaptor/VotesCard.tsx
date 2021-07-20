import { formatEthereumAddress, resolveAddressLinkOnExplorer, resolveIPFSLink, useChainId } from '@masknet/web3-shared'
import { Avatar, Badge, Box, Link, List, ListItem, makeStyles, Typography } from '@material-ui/core'
import classNames from 'classnames'
import millify from 'millify'
import { useContext } from 'react'
import { useI18N } from '../../../utils'
import { EthereumBlockie } from '../../../web3/UI/EthereumBlockie'
import { SnapshotContext } from '../context'
import { useRetry } from './hooks/useRetry'
import { useVotes } from './hooks/useVotes'
import type { VoteItem } from '../types'
import { LoadingCard } from './LoadingCard'
import { LoadingFailCard } from './LoadingFailCard'
import { SnapshotCard } from './SnapshotCard'

const useStyles = makeStyles((theme) => {
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
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        anchorTopRight: {
            transform: 'translateX(36px) translateY(4.5px)',
        },
        avatarWrapper: {
            marginRight: 8,
        },
        choice: {
            flexGrow: 1,
        },
        ellipsisText: {
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
        avatar: {
            width: 16,
            height: 16,
        },
        link: {
            display: 'flex',
            width: '35%',
            color: 'inherit',
            alignItems: 'center',
            textDecoration: 'none !important',
            marginRight: 16,
        },
    }
})

function Content() {
    const chainId = useChainId()
    const identifier = useContext(SnapshotContext)
    const { payload: votes } = useVotes(identifier)
    const classes = useStyles()
    const { t } = useI18N()
    const voteEntries = Object.entries(votes)

    return (
        <SnapshotCard
            title={
                <Badge
                    max={9999999}
                    classes={{ anchorOriginTopRightRectangular: classes.anchorTopRight }}
                    badgeContent={voteEntries.length}
                    color="primary">
                    {t('plugin_snapshot_votes_title')}
                </Badge>
            }>
            <List className={classes.list}>
                {voteEntries.map((voteEntry: [string, VoteItem]) => {
                    return (
                        <ListItem className={classes.listItem} key={voteEntry[0]}>
                            <Link
                                className={classNames(classes.link, classes.ellipsisText)}
                                target="_blank"
                                rel="noopener"
                                href={resolveAddressLinkOnExplorer(chainId, voteEntry[0])}>
                                <Box className={classes.avatarWrapper}>
                                    {voteEntry[1].authorAvatar ? (
                                        <Avatar
                                            src={resolveIPFSLink(voteEntry[1].authorAvatar)}
                                            className={classes.avatar}
                                        />
                                    ) : (
                                        <EthereumBlockie address={voteEntry[0]} />
                                    )}
                                </Box>
                                <Typography>
                                    {voteEntry[1].authorName ?? formatEthereumAddress(voteEntry[0], 4)}
                                </Typography>
                            </Link>
                            <Typography className={classes.choice}>{voteEntry[1].choice}</Typography>
                            <Typography>
                                {millify(voteEntry[1].balance, { precision: 2, lowercase: true }) +
                                    ' ' +
                                    (voteEntry[1].strategySymbol ? voteEntry[1].strategySymbol.toUpperCase() : '')}
                            </Typography>
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
    const retry = useRetry()
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
