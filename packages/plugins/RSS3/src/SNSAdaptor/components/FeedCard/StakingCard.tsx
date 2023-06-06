import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { resolveResourceURL } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { Translate } from '../../../locales/i18n_generated.js'
import { useI18N } from '../../../locales/index.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { Label, formatValue } from './common.js'

const useStyles = makeStyles<void, 'tokenIcon' | 'verboseToken'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
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
export const StakingCard: FC<StakingFeedCardProps> = ({ feed, ...rest }) => {
    const { verbose } = rest
    const t = useI18N()
    const { classes, cx } = useStyles()

    const action = feed.actions.find((x) => x.type === Type.Staking)
    const metadata = action?.metadata

    const owner = useFeedOwner()
    const user = useAddressLabel(owner.address)

    const cardType = metadata?.action === 'stake' ? CardType.TokenStake : CardType.TokenUnstake

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <Translate.token_staking
                    values={{
                        user,
                        symbol: metadata?.token.symbol!,
                        context: metadata?.action!,
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
            {metadata ? (
                <div className={cx(classes.token, verbose ? classes.verboseToken : null)}>
                    <Image
                        classes={{ container: classes.tokenIcon }}
                        src={resolveResourceURL(metadata.token.image)}
                        height={40}
                        width={40}
                    />
                    <Typography className={classes.value}>
                        {t.token_value({
                            value: formatValue(metadata.token),
                            symbol: metadata.token.symbol,
                        })}
                    </Typography>
                </div>
            ) : null}
        </CardFrame>
    )
}
