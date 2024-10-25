import { Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { type HTMLProps, memo, useState } from 'react'
import { CardType } from '../share.js'
import { Slider } from '../Slider.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { DonationAction } from '../FeedActions/DonationAction.js'
import { useMarkdownStyles } from '../../hooks/useMarkdownStyles.js'

const useStyles = makeStyles()((theme) => ({
    badge: {
        display: 'inline-block',
        height: 18,
        lineHeight: '18px',
        borderRadius: 4,
        marginLeft: theme.spacing(1.5),
        fontSize: 12,
        backgroundColor: theme.palette.maskColor.main,
        color: theme.palette.maskColor.bottom,
        padding: '0 6px',
    },
    content: {
        marginTop: theme.spacing(1.5),
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
        alignItems: 'flex-start',
    },
    body: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    info: {
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: 14,
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        marginLeft: theme.spacing(1.5),
        height: 80,
    },
    title: {
        fontWeight: 700,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    subtitle: {
        fontWeight: 400,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
    },
}))

const { Tag } = RSS3BaseAPI
export function isDonationFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.DonationFeed {
    return feed.tag === Tag.Donation
}

interface DonationCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.DonationFeed
}

interface CardBodyProps extends HTMLProps<HTMLDivElement> {
    metadata: RSS3BaseAPI.DonateMetadata
}
const CardBody = memo(({ metadata, className, ...rest }: CardBodyProps) => {
    const { classes, cx } = useStyles()
    return (
        <div className={cx(classes.body, className)} {...rest}>
            <div className={classes.info}>
                <Typography className={classes.title}>{metadata.title}</Typography>
                <Typography className={classes.subtitle}>{metadata.description}</Typography>
            </div>
        </div>
    )
})

/**
 * DonationCard
 * Including:
 *
 * - DonationDonate
 */
export function DonationCard({ feed, actionIndex, className, ...rest }: DonationCardProps) {
    const { verbose } = rest
    const { classes } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

    const [index, setIndex] = useState(0)
    const activeActionIndex = actionIndex ?? index
    // Might mixin a transaction action
    const availableActions = feed.actions.filter((x) => x.metadata?.title)
    const action = availableActions[activeActionIndex]
    const metadata = action.metadata

    const actionSize = feed.actions.length
    const badge = actionSize > 1 ? <Typography className={classes.badge}>+{actionSize}</Typography> : null

    if (verbose) {
        return (
            <CardFrame type={CardType.DonationDonate} feed={feed} className={className} badge={badge} {...rest}>
                <DonationAction feed={feed} verbose />
                <Markdown className={mdClasses.markdown} defaultStyle={false}>
                    {metadata!.description}
                </Markdown>
            </CardFrame>
        )
    }

    return (
        <CardFrame
            type={CardType.DonationDonate}
            feed={feed}
            actionIndex={activeActionIndex}
            badge={badge}
            className={className}
            {...rest}>
            <DonationAction feed={feed} />
            {availableActions.length > 1 ?
                <Slider count={availableActions.length} className={classes.content} onUpdate={setIndex}>
                    {availableActions.map((action, index) => (
                        <CardBody key={index} metadata={action.metadata!} />
                    ))}
                </Slider>
            :   <CardBody className={classes.content} metadata={availableActions[0].metadata!} />}
        </CardFrame>
    )
}
