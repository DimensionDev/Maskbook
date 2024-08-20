import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { resolveResourceURL } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { useRSS3Trans } from '../../../locales/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { formatValue } from '../common.js'
import { StakingAction } from '../FeedActions/StakingAction.js'

const useStyles = makeStyles<void, 'tokenIcon' | 'verboseToken'>()((theme, _, refs) => ({
    tokenIcon: {},
    verboseToken: {},
    token: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing(1),
        [`.${refs.tokenIcon}`]: {
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
        },
        [`&.${refs.verboseToken}`]: {
            height: 186,
            justifyContent: 'center',
        },
    },
    value: {
        color: theme.palette.maskColor.main,
        marginLeft: theme.spacing(1.5),
        fontSize: 14,
        fontWeight: 700,
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isStakingFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.StakingFeed {
    return feed.tag === Tag.Exchange && feed.type === Type.Staking
}

interface StakingFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.StakingFeed
}

/**
 * StakingCard.
 * Including:
 *
 * - TokenStake
 * - TokenUnstake
 */
export function StakingCard({ feed, ...rest }: StakingFeedCardProps) {
    const { verbose } = rest
    const t = useRSS3Trans()
    const { classes, cx } = useStyles()

    const action = feed.actions.find((x) => x.type === Type.Staking)
    const metadata = action?.metadata

    const cardType = metadata?.action === 'stake' ? CardType.TokenStake : CardType.TokenUnstake

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <StakingAction feed={feed} />
            {metadata ?
                <div className={cx(classes.token, verbose ? classes.verboseToken : null)}>
                    <Image
                        classes={{ container: classes.tokenIcon }}
                        src={resolveResourceURL(metadata?.token.image)}
                        height={40}
                        width={40}
                    />
                    <Typography className={classes.value}>
                        {t.token_value({
                            value: formatValue(metadata.token),
                            symbol: metadata.token?.symbol,
                        })}
                    </Typography>
                </div>
            :   null}
        </CardFrame>
    )
}
