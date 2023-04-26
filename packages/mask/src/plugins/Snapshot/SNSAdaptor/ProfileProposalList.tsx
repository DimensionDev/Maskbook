import { List, ListItem, Typography, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { millify } from 'millify'
import type { SnapshotProposal } from '@masknet/web3-providers/types'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { EthereumBlockie } from '@masknet/shared'
import { formatElapsed, formatElapsedPure, formatPercentage } from '@masknet/web3-shared-base'
import { startCase } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18N } from '../../../utils/index.js'
import { Icons } from '@masknet/icons'
import { useIntersectionObserver } from '@react-hookz/web'
import { useCurrentAccountVote } from './hooks/useCurrentAccountVote.js'

const useStyles = makeStyles<{ state?: string }>()((theme, { state }) => {
    return {
        root: {
            maxHeight: 1018,
            overflow: 'scroll',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
        listItem: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            marginTop: 14,
        },
        authorInfo: { display: 'flex', alignItems: 'center' },
        author: { fontSize: 16, fontWeight: 700 },
        state: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 32,
            width: 72,
            borderRadius: 99,
            color:
                state === 'active' || state === 'pending' ? theme.palette.common.white : theme.palette.maskColor.bottom,
            backgroundColor:
                state === 'active'
                    ? theme.palette.maskColor.success
                    : state === 'pending'
                    ? theme.palette.maskColor.warn
                    : theme.palette.maskColor.main,
        },
        blockieIcon: {
            width: 20,
            height: 20,
            marginRight: 8,
        },
        body: {
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
        },
        title: {
            fontSize: 16,
            marginTop: 14,
            marginBottom: 8,
            fontWeight: 700,
        },
        detail: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
        },
        date: {
            fontSize: 14,
            marginTop: 12,
            marginBottom: 8,
        },
        voteList: {
            width: '100%',
            paddingTop: 0,
            paddingBottom: 12,
            borderBottom: `1px solid ${theme.palette.maskColor.line}`,
        },
        voteItem: {
            padding: '8px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 4,
        },
        selectedVoteItem: {
            background: theme.palette.maskColor.bg,
        },
        voteName: {
            fontWeight: 700,
            fontSize: 14,
            marginRight: 12,
            maxWidth: 350,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        voteIcon: {
            marginRight: 12,
        },
        strategyName: { fontSize: 14 },
        percentage: {},
        voteInfo: {
            display: 'flex',
            alignItems: 'center',
        },
        myVote: {
            height: 18,
            width: 46,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.palette.maskColor.main,
            marginLeft: 12,
        },
        myVoteText: {
            fontSize: 10,
            fontWeight: 700,
            color: theme.palette.maskColor.bottom,
        },
    }
})

export interface ProfileProposalListProps {
    proposalList: SnapshotProposal[]
}

export function ProfileProposalList(props: ProfileProposalListProps) {
    const { proposalList } = props
    const { classes } = useStyles({})

    return (
        <List className={classes.root}>
            {proposalList.map((x, i) => {
                return <ProfileProposalListItem proposal={x} key={i} />
            })}
        </List>
    )
}

interface ProfileProposalProps {
    proposal: SnapshotProposal
}

function ProfileProposalListItem(props: ProfileProposalProps) {
    const { proposal } = props
    const { classes } = useStyles({})
    const ref = useRef<HTMLLIElement | null>(null)
    const entry = useIntersectionObserver(ref, {})
    const [isViewed, setIsViewed] = useState(false)

    useEffect(() => {
        if (entry?.isIntersecting && entry?.intersectionRatio > 0) setIsViewed(true)
    }, [entry?.isIntersecting])

    return (
        <ListItem className={classes.listItem} ref={ref}>
            {isViewed ? (
                <>
                    <ProfileProposalListItemHeader proposal={proposal} />
                    <ProfileProposalListItemBody proposal={proposal} />
                    <ProfileProposalListItemVote proposal={proposal} />
                </>
            ) : null}
        </ListItem>
    )
}

function ProfileProposalListItemHeader(props: ProfileProposalProps) {
    const { proposal } = props
    const { classes } = useStyles({ state: proposal.state })
    const { Others } = useWeb3State()

    return (
        <section className={classes.header}>
            <div className={classes.authorInfo}>
                <EthereumBlockie address={proposal.author} classes={{ icon: classes.blockieIcon }} />
                <Typography className={classes.author}>{Others?.formatAddress(proposal.author, 4)}</Typography>
            </div>
            <div className={classes.state}>
                <Typography fontWeight={700}>{startCase(proposal.state)}</Typography>
            </div>
        </section>
    )
}

function ProfileProposalListItemBody(props: ProfileProposalProps) {
    const { proposal } = props
    const { classes } = useStyles({ state: proposal.state })
    const { t } = useI18N()

    const date = useMemo(() => {
        const now = Date.now()
        if (now < proposal.start * 1000) {
            return t('plugin_snapshot_proposal_not_start', { date: formatElapsedPure(proposal.start * 1000, false) })
        } else if (now > proposal.end * 1000) {
            return t('plugin_snapshot_proposal_ended', { date: formatElapsed(proposal.end * 1000) })
        } else {
            return t('plugin_snapshot_proposal_started', { date: formatElapsedPure(proposal.end * 1000, false) })
        }
    }, [proposal.start, proposal.end])

    return (
        <section className={classes.detail}>
            <Typography className={classes.title}>{proposal.title}</Typography>
            <Typography className={classes.body}>{proposal.body}</Typography>
            <Typography className={classes.date}>{date}</Typography>
        </section>
    )
}

function ProfileProposalListItemVote(props: ProfileProposalProps) {
    const { proposal } = props
    const { classes, cx } = useStyles({ state: proposal.state })
    const theme = useTheme()
    const { t } = useI18N()
    const { value: currentAccountVote } = useCurrentAccountVote(proposal.id)

    return (
        <List className={classes.voteList}>
            {proposal.choices.map((x, i) => (
                <ListItem key={i} className={cx(classes.voteItem, i === 0 ? classes.selectedVoteItem : '')}>
                    <div className={classes.voteInfo}>
                        {i === 0 ? (
                            <Icons.Check color={theme.palette.maskColor.main} size={18} className={classes.voteIcon} />
                        ) : null}
                        <Typography className={classes.voteName}>{x}</Typography>
                        <Typography className={classes.strategyName}>
                            {(proposal.choicesWithScore[i].score
                                ? millify(proposal.choicesWithScore[i].score, {
                                      precision: 2,
                                      lowercase: true,
                                  }).toUpperCase()
                                : '0') +
                                ' ' +
                                proposal.strategyName}
                        </Typography>
                        {currentAccountVote?.choice === i + 1 ? (
                            <div className={classes.myVote}>
                                <Typography className={classes.myVoteText}>{t('plugin_snapshot_my_vote')}</Typography>
                            </div>
                        ) : null}
                    </div>

                    <Typography className={classes.percentage}>
                        {formatPercentage(
                            proposal.scores_total ? proposal.choicesWithScore[i].score / proposal.scores_total : 0,
                        )}
                    </Typography>
                </ListItem>
            ))}
        </List>
    )
}
