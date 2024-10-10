import { startCase } from 'lodash-es'
import { useMemo, useRef, useState } from 'react'
import { List, ListItem, Typography, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { SnapshotBaseAPI } from '@masknet/web3-providers/types'
import { useReverseAddress, useWeb3Utils } from '@masknet/web3-hooks-base'
import { EthereumBlockie } from '@masknet/shared'
import { formatCount, formatPercentage } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'
import { useIntersectionObserver } from '@react-hookz/web'
import { NetworkPluginID } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { resolveSnapshotProposalUrl } from './helpers.js'
import { useCurrentAccountVote } from './hooks/useCurrentAccountVote.js'
import { Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { intlFormatDistance } from 'date-fns'

const useStyles = makeStyles<{ state?: string }>()((theme, { state }) => {
    return {
        root: {
            maxHeight: 1018,
            paddingTop: 0,
            overflow: 'scroll',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 8 },
        listItem: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 16,
            paddingBottom: 0,
            cursor: 'pointer',
            '&:hover': {
                background: theme.palette.maskColor.bg,
            },
        },
        authorInfo: { display: 'flex', alignItems: 'center' },
        author: { fontSize: 16, fontWeight: 700, wordBreak: 'break-word' },
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
                state === 'active' ? theme.palette.maskColor.success
                : state === 'pending' ? theme.palette.maskColor.warn
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
        strategyName: {
            fontSize: 14,
            color: theme.palette.maskColor.secondaryDark,
        },
        percentage: {
            fontWeight: 700,
            fontSize: 14,
        },
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

interface ProfileProposalListProps {
    proposalList: SnapshotBaseAPI.SnapshotProposal[]
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
    proposal: SnapshotBaseAPI.SnapshotProposal
}

function ProfileProposalListItem(props: ProfileProposalProps) {
    const { proposal } = props
    const { classes } = useStyles({})
    const ref = useRef<HTMLLIElement | null>(null)
    const entry = useIntersectionObserver(ref.current, {})
    const [isViewed, setIsViewed] = useState(false)

    if (!isViewed && entry?.isIntersecting && entry.intersectionRatio > 0) setIsViewed(true)

    return (
        <ListItem
            className={classes.listItem}
            ref={ref}
            onClick={() => openWindow(resolveSnapshotProposalUrl(proposal.space.id, proposal.id))}>
            {isViewed ?
                <>
                    <ProfileProposalListItemHeader proposal={proposal} />
                    <ProfileProposalListItemBody proposal={proposal} />
                    <ProfileProposalListItemVote proposal={proposal} />
                </>
            :   null}
        </ListItem>
    )
}

function ProfileProposalListItemHeader(props: ProfileProposalProps) {
    const { proposal } = props
    const { classes } = useStyles({ state: proposal.state })
    const Utils = useWeb3Utils()
    const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, proposal.author)

    return (
        <section className={classes.header}>
            <div className={classes.authorInfo}>
                <EthereumBlockie address={proposal.author} classes={{ icon: classes.blockieIcon }} />
                <Typography className={classes.author}>{domain ?? Utils.formatAddress(proposal.author, 4)}</Typography>
            </div>
            <div>
                <Typography fontWeight={700} fontSize={12} className={classes.state}>
                    {startCase(proposal.state)}
                </Typography>
            </div>
        </section>
    )
}

function ProfileProposalListItemBody(props: ProfileProposalProps) {
    const { proposal } = props
    const { classes } = useStyles({ state: proposal.state })
    const { i18n } = useLingui()

    const date = useMemo(() => {
        const now = Date.now()
        const start = proposal.start * 1000
        const end = proposal.end * 1000
        const relativeStartTime = intlFormatDistance(new Date(start), now, { locale: i18n.locale })
        const relativeEndTime = intlFormatDistance(new Date(end), now, { locale: i18n.locale })
        if (now < start) {
            return <Trans>Starts {relativeStartTime}</Trans>
        } else if (now > end) {
            return <Trans>Ended {relativeEndTime}</Trans>
        } else {
            return <Trans>Ends in {relativeEndTime}</Trans>
        }
    }, [i18n.locale, proposal.start, proposal.end])

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
    const { value: currentAccountVote } = useCurrentAccountVote(proposal.id, proposal.votes)

    return (
        <List className={classes.voteList}>
            {proposal.choices.map((x, i) => (
                <ListItem
                    key={i}
                    className={cx(
                        classes.voteItem,
                        i === 0 && proposal.state !== 'pending' ? classes.selectedVoteItem : '',
                    )}>
                    <div className={classes.voteInfo}>
                        {i === 0 && proposal.state !== 'pending' ?
                            <Icons.Check color={theme.palette.maskColor.main} size={18} className={classes.voteIcon} />
                        :   null}
                        <Typography className={classes.voteName}>{x}</Typography>
                        <Typography className={classes.strategyName}>
                            {(proposal.choicesWithScore[i].score ?
                                formatCount(proposal.choicesWithScore[i].score, 1)
                            :   '0') +
                                ' ' +
                                proposal.strategyName}
                        </Typography>
                        {currentAccountVote?.choice === i + 1 ?
                            <div className={classes.myVote}>
                                <Typography className={classes.myVoteText}>
                                    <Trans>My vote</Trans>
                                </Typography>
                            </div>
                        :   null}
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
