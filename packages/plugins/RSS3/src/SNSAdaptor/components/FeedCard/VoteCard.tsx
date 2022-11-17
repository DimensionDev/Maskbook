import { Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { Translate } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { Label } from './common.js'
import { useMarkdownStyles } from './useMarkdownStyles.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        fontSize: 14,
        color: theme.palette.maskColor.third,
    },
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
export const VoteCard: FC<VoteCardProps> = ({ feed, ...rest }) => {
    const { verbose } = rest
    const { classes } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)
    const option = metadata?.choice ? metadata?.proposal.options[Number.parseInt(metadata.choice, 10) - 1] : ''

    return (
        <CardFrame type={CardType.GovernanceVote} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <Translate.vote
                    values={{
                        user,
                        option,
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
            {metadata?.proposal ? (
                <>
                    <Typography className={classes.title}>{metadata.proposal.title}</Typography>
                    {verbose ? (
                        <Markdown className={mdClasses.markdown} defaultStyle={false}>
                            {metadata.proposal.body}
                        </Markdown>
                    ) : (
                        <Typography className={classes.content}>{metadata.proposal.body}</Typography>
                    )}
                </>
            ) : null}
        </CardFrame>
    )
}
