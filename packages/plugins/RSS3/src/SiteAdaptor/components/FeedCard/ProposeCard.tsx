import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { ProposeAction } from '../FeedActions/ProposeAction.js'

const useStyles = makeStyles()((theme) => ({
    title: {
        marginTop: theme.spacing(1),
        color: theme.palette.maskColor.main,
    },
    content: {
        marginTop: theme.spacing(1),
        fontSize: 14,
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        marginLeft: theme.spacing(1.5),
        maxHeight: 80,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 3,
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isProposeFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.ProposeFeed {
    return feed.tag === Tag.Governance && feed.type === Type.Propose
}

interface ProposeCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.ProposeFeed
}

/**
 * ProposeCard
 * Including:
 *
 * - NoteCreate
 * - NoteEdit
 */
export function ProposeCard({ feed, ...rest }: ProposeCardProps) {
    const { classes } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    return (
        <CardFrame type={CardType.GovernancePropose} feed={feed} {...rest}>
            <ProposeAction feed={feed} />
            {metadata?.title ?
                <Typography className={classes.title}>{metadata.title}</Typography>
            :   null}
            <Typography className={classes.content}>{metadata?.body}</Typography>
        </CardFrame>
    )
}
