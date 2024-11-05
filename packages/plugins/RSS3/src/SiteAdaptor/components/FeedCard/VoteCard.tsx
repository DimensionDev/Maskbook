import { Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import Linkify from 'linkify-react'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { LinkifyOptions, htmlToPlain } from '../common.js'
import { VoteAction } from '../FeedActions/VoteAction.js'
import { useMarkdownStyles } from '../../hooks/useMarkdownStyles.js'

const useStyles = makeStyles()((theme) => ({
    title: {
        marginTop: theme.spacing(1.5),
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
    },
    content: {
        color: theme.palette.maskColor.main,
        whiteSpace: 'pre-wrap',
        maxHeight: '3em',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isVoteFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.VoteFeed {
    return feed.tag === Tag.Governance && feed.type === Type.Vote
}

interface VoteCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.VoteFeed
}

/**
 * DonationCard
 * Including:
 *
 * - NoteCreate
 * - NoteEdit
 */
export function VoteCard({ feed, ...rest }: VoteCardProps) {
    const { verbose } = rest
    const { classes } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    if (!metadata) return null

    return (
        <CardFrame type={CardType.GovernanceVote} feed={feed} {...rest}>
            <VoteAction feed={feed} />
            {metadata.proposal ?
                <>
                    <Typography className={classes.title}>{metadata.proposal.title}</Typography>
                    {verbose ?
                        <Markdown className={mdClasses.markdown} defaultStyle={false}>
                            {metadata.proposal.body}
                        </Markdown>
                    :   <Typography className={classes.content}>
                            <Linkify options={LinkifyOptions}>{htmlToPlain(metadata.proposal.body)}</Linkify>
                        </Typography>
                    }
                </>
            :   null}
        </CardFrame>
    )
}
