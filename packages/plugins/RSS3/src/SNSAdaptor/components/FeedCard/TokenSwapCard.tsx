import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { useI18N } from '../../../locales'
import { Translate } from '../../../locales/i18n_generated'
import { useAddressLabel } from '../../hooks'
import { CardType } from '../share'
import { CardFrame, FeedCardProps } from '../base'
import { formatValue, Label } from './common'

const useStyles = makeStyles<void, 'tokenIcon' | 'verboseToken'>()((theme, _, refs) => ({
    summary: {
        fontSize: '14px',
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
export const TokenSwapCard: FC<TokenSwapCardProps> = ({ feed, ...rest }) => {
    const { verbose } = rest
    const t = useI18N()
    const { classes, cx } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)

    return (
        <CardFrame type={CardType.TokenSwap} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <Translate.token_swap
                    values={{
                        user,
                        from_value: formatValue(metadata?.from),
                        from_symbol: metadata?.from.symbol ?? '-',
                        to_value: formatValue(metadata?.to),
                        to_symbol: metadata?.to.symbol ?? '-',
                        platform: feed.platform!,
                        context: verbose ? 'verbose' : 'normal',
                    }}
                    components={{
                        user: <Label title={feed.owner} />,
                        platform: <Label title={feed.platform!} />,
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
                            height={32}
                            width={32}
                        />
                        <Image
                            classes={{ container: classes.tokenIcon }}
                            src={metadata.to.image}
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
