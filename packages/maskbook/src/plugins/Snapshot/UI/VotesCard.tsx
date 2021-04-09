// import Jazzicon from 'react-jazzicon'
import { useContext, useRef, useEffect, useState, useMemo } from 'react'
import type { Vote } from '../types'
import millify from 'millify'
import { Avatar, List, createStyles, makeStyles, Typography, ListItem, Badge, Box } from '@material-ui/core'
import { resolveIPFSLink } from '../../../web3/pipes'
import { formatEthereumAddress } from '../../../plugins/Wallet/formatter'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotContext } from '../context'
import { useVotes } from '../hooks/useVotes'
import { SnapshotCard } from './SnapshotCard'

export interface VotesCardProps {}

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
        address: {
            width: '40%',
            display: 'flex',
            alignItems: 'center',
        },
        choice: {
            flexGrow: 1,
        },
        avatar: {
            width: 20,
            height: 20,
            marginRight: 8,
        },
    })
})

export function VotesCard(props: VotesCardProps) {
    const { t } = useI18N()
    const identifier = useContext(SnapshotContext)
    const { payload: votes } = useVotes(identifier)
    const classes = useStyles()
    console.log('votes', votes)
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
                            <Box className={classes.address}>
                                {voteEntry[1].authorAvatar ? (
                                    <Avatar
                                        src={resolveIPFSLink(voteEntry[1].authorAvatar)}
                                        className={classes.avatar}
                                    />
                                ) : (
                                    null
                                )}
                                <Typography>{formatEthereumAddress(voteEntry[0], 4)}</Typography>
                            </Box>
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
