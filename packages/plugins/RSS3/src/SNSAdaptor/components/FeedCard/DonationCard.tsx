import { Image, Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { type FC, type HTMLProps, memo, useState } from 'react'
import { Translate } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardType } from '../share.js'
import { Slider } from '../Slider.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { formatValue, Label } from './common.js'
import { useMarkdownStyles } from './useMarkdownStyles.js'

const useStyles = makeStyles<void, 'image'>()((theme, _, refs) => ({
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
    summary: {
        color: theme.palette.maskColor.third,
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
        [`.${refs.image}`]: {
            width: 64,
            height: 64,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
        },
    },
    image: {
        img: {
            objectFit: 'cover',
        },
    },
    verbose: {
        [`.${refs.image}`]: {
            marginTop: theme.spacing(1),
            aspectRatio: 'auto',
        },
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
const CardBody: FC<CardBodyProps> = memo(({ metadata, className, ...rest }) => {
    const { classes, cx } = useStyles()
    return (
        <div className={cx(classes.body, className)} {...rest}>
            <Image classes={{ container: classes.image }} src={metadata.logo} height={64} width={64} />
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
export const DonationCard: FC<DonationCardProps> = ({ feed, actionIndex, className, ...rest }) => {
    const { verbose } = rest
    const { classes, cx } = useStyles()
    const { classes: mdClasses } = useMarkdownStyles()

    const [index, setIndex] = useState(0)
    const activeActionIndex = actionIndex ?? index
    // Might mixin a transaction action
    const availableActions = feed.actions.filter((x) => x.metadata?.title)
    const action = availableActions[activeActionIndex]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)
    const actionSize = feed.actions.length
    const badge = actionSize > 1 ? <Typography className={classes.badge}>+{actionSize}</Typography> : null

    if (verbose) {
        return (
            <CardFrame
                type={CardType.DonationDonate}
                feed={feed}
                className={cx(rest.verbose ? classes.verbose : null, className)}
                badge={badge}
                {...rest}>
                <Typography className={classes.summary}>
                    <Translate.donation_donate_verbose
                        values={{
                            user,
                            cost_value: formatValue(metadata?.token),
                            cost_symbol: metadata?.token.symbol ?? 'Unknown Token',
                            project: action.metadata?.title ?? 'Unknown Project',
                        }}
                        components={{
                            bold: <Label />,
                        }}
                    />
                </Typography>
                <Image classes={{ container: classes.image }} src={metadata!.logo} width="100%" />
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
            <Typography className={classes.summary}>
                <Translate.donation_donate
                    values={{
                        user,
                        cost_value: formatValue(metadata?.token),
                        cost_symbol: metadata?.token.symbol ?? 'Unknown Token',
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
            {availableActions.length > 1 ? (
                <Slider className={classes.content} onUpdate={setIndex}>
                    {availableActions.map((action, index) => (
                        <CardBody key={index} metadata={action.metadata!} />
                    ))}
                </Slider>
            ) : (
                <CardBody className={classes.content} metadata={availableActions[0].metadata!} />
            )}
        </CardFrame>
    )
}
