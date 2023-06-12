import { Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import Linkify from 'linkify-react'
import { useMemo } from 'react'
import { Translate } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { Label, LinkifyOptions, htmlToPlain } from './common.js'
import { useMarkdownStyles } from './useMarkdownStyles.js'

const useStyles = makeStyles<void, 'summary'>()((theme, _, refs) => ({
    verbose: {
        [`.${refs.summary}`]: {
            whiteSpace: 'normal',
            overflow: 'visible',
            span: {
                whiteSpace: 'normal',
            },
        },
    },
    summary: {
        fontSize: 14,
        color: theme.palette.maskColor.third,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
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
export const VoteCard = ({ feed, className, ...rest }: VoteCardProps) => {
    const { verbose } = rest
    const { classes, cx } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)
    const option = useMemo(() => {
        if (!metadata?.choice) return ''
        const { choice, proposal } = metadata
        const choices: number[] = /^\[.*?]$/.test(choice) ? JSON.parse(choice) : [Number.parseInt(choice, 10)]
        return choices.map((no) => proposal.options[no - 1]).join(', ')
    }, [metadata?.choice, metadata?.proposal])

    if (!metadata) return null

    return (
        <CardFrame
            type={CardType.GovernanceVote}
            feed={feed}
            className={cx(className, verbose ? classes.verbose : null)}
            {...rest}>
            <Typography className={classes.summary}>
                <Translate.vote
                    values={{
                        user,
                        option,
                        platform: action.platform!,
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
            {metadata.proposal ? (
                <>
                    <Typography className={classes.title}>{metadata.proposal.title}</Typography>
                    {verbose ? (
                        <Markdown className={mdClasses.markdown} defaultStyle={false}>
                            {metadata.proposal.body}
                        </Markdown>
                    ) : (
                        <Typography className={classes.content}>
                            <Linkify options={LinkifyOptions}>{htmlToPlain(metadata.proposal.body)}</Linkify>
                        </Typography>
                    )}
                </>
            ) : null}
        </CardFrame>
    )
}
