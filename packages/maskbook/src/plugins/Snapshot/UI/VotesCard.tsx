import { useContext } from 'react'
import classNames from 'classnames'
import type { Vote } from '../types'
import millify from 'millify'
import { Avatar, List, createStyles, makeStyles, Typography, ListItem, Badge, Box, Link } from '@material-ui/core'
import { resolveIPFSLink, resolveAddressLinkOnEtherscan } from '../../../web3/pipes'
import { formatEthereumAddress } from '../../../plugins/Wallet/formatter'
import { SnapshotContext } from '../context'
import { useVotes } from '../hooks/useVotes'
import { SnapshotCard } from './SnapshotCard'
import { EthereumBlockie } from '../../../web3/UI/EthereumBlockie'
import { useChainId } from '../../../web3/hooks/useChainState'

const useStyles = makeStyles((theme) => {
    return createStyles({
        list: {
            display: 'flex',
            flexDirection: 'column',
            height: 'var(--contentHeight)',
            overflow: 'scroll',
            paddingTop: 0,
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
    })
})

export function VotesCard() {
    const chainId = useChainId()
    const identifier = useContext(SnapshotContext)
    const { payload: votes } = useVotes(identifier)
    const classes = useStyles()
    const voteEntries = Object.entries(votes)

    return (
        <SnapshotCard
            title={
                <Badge
                    classes={{ anchorOriginTopRightRectangular: classes.anchorTopRight }}
                    badgeContent={voteEntries.length}
                    color="primary">
                    Votes
                </Badge>
            }>
            <List className={classes.list}>
                {voteEntries.map((voteEntry: [string, Vote]) => {
                    return (
                        <ListItem className={classes.listItem} key={voteEntry[0]}>
                            <Link
                                className={classNames(classes.link, classes.ellipsisText)}
                                target="_blank"
                                rel="noopener"
                                href={resolveAddressLinkOnEtherscan(chainId, voteEntry[0])}>
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
                                    voteEntry[1].msg.space.toUpperCase()}
                            </Typography>
                        </ListItem>
                    )
                })}
            </List>
        </SnapshotCard>
    )
}
