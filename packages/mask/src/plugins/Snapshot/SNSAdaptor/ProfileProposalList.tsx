import { List, ListItem, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { SnapshotProposal } from '@masknet/web3-providers/types'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { EthereumBlockie } from '@masknet/shared'
import { formatElapsed, formatElapsedPure } from '@masknet/web3-shared-base'
import { startCase } from 'lodash-es'
import { useMemo } from 'react'
import { useI18N } from '../../../utils/index.js'

const useStyles = makeStyles<{ state?: string }>()((theme, { state }) => {
    return {
        root: {},
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
        listItem: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderBottom: `1px solid ${theme.palette.maskColor.line}`,
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
            color: theme.palette.maskColor.bottom,
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
            marginBottom: 12,
        },
    }
})

export interface ProfileProposalListProps {
    proposalList: SnapshotProposal[]
}

export function ProfileProposalList(props: ProfileProposalListProps) {
    const { proposalList } = props
    const { classes } = useStyles({})
    const { Others } = useWeb3State()
    return (
        <List className={classes.root}>
            {proposalList.map((x, i) => {
                return (
                    <ListItem key={i} className={classes.listItem}>
                        <ProfileProposalListItemHeader proposal={x} />
                        <ProfileProposalListItemBody proposal={x} />
                        <ProfileProposalListItemVote proposal={x} />
                    </ListItem>
                )
            })}
        </List>
    )
}

interface ProfileProposalProps {
    proposal: SnapshotProposal
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
                <Typography>{startCase(proposal.state)}</Typography>
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
    const { classes } = useStyles({ state: proposal.state })
    const { t } = useI18N()

    return <Typography className={classes.title}>{proposal.title}</Typography>
}
