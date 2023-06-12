import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useI18N } from '../../../locales/index.js'
import { Translate } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { formatValue, Label } from './common.js'

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
            width: 32,
            height: 32,
            borderRadius: '50%',
            overflow: 'hidden',
        },
        [`&.${refs.verboseToken}`]: {
            height: 186,
            justifyContent: 'center',
        },
    },
    iconStack: {
        display: 'flex',
        [`.${refs.tokenIcon}:not(:first-of-type)`]: {
            marginLeft: -7,
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
export function isTokenSwapFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenSwapFeed {
    return feed.tag === Tag.Exchange && feed.type === Type.Swap
}

interface TokenSwapCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenSwapFeed
}

/**
 * TokenSwapCard
 * Including:
 *
 * - TokenSwap
 */
export function TokenSwapCard({ feed, ...rest }: TokenSwapCardProps) {
    const { verbose } = rest
    const t = useI18N()
    const { classes, cx } = useStyles()

    // You might see some `transfer` type actions as well
    const action = feed.actions.filter((x) => x.tag === Tag.Exchange && x.type === Type.Swap)[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)

    return (
        <CardFrame type={CardType.TokenSwap} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <Translate.token_swap
                    values={{
                        user,
                        from_value: formatValue(metadata?.from),
                        from_symbol: metadata?.from.symbol ?? 'Unknown Token',
                        to_value: formatValue(metadata?.to),
                        to_symbol: metadata?.to.symbol ?? 'Unknown Token',
                        platform: feed.platform!,
                        context: verbose ? 'verbose' : 'normal',
                    }}
                    components={{
                        user: <Label title={feed.owner} />,
                        platform: <Label title={feed.platform} />,
                        bold: <Label />,
                    }}
                />
            </Typography>
            {metadata ? (
                <div className={cx(classes.token, verbose ? classes.verboseToken : null)}>
                    <div className={classes.iconStack}>
                        <Image
                            classes={{ container: classes.tokenIcon }}
                            src={metadata.from.image}
                            fallback={<img src={metadata.from.image} className={classes.tokenIcon} />}
                            height={32}
                            width={32}
                        />
                        <Image
                            classes={{ container: classes.tokenIcon }}
                            src={metadata.to.image}
                            fallback={<img src={metadata.to.image} className={classes.tokenIcon} />}
                            height={32}
                            width={32}
                        />
                    </div>
                    <Typography className={classes.value}>
                        {t.token_swap_pair({
                            from_value: formatValue(metadata.from),
                            from_symbol: metadata.from.symbol,
                            to_value: formatValue(metadata.to),
                            to_symbol: metadata.to.symbol,
                        })}
                    </Typography>
                </div>
            ) : null}
        </CardFrame>
    )
}
