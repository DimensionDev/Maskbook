import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { resolveResourceURL } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { Translate } from '../../../locales/i18n_generated.js'
import { useI18N } from '../../../locales/index.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { Label, formatValue } from './common.js'

const useStyles = makeStyles<void, 'tokenIcon' | 'supply' | 'withdraw' | 'horizonCenter'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
    tokenIcon: {},
    // helper box to center token list in horizontal direction
    horizonCenter: {},
    tokenList: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
    },
    verbose: {
        [`.${refs.horizonCenter}`]: {
            minHeight: 186,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    },
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
    },
    supply: {},
    withdraw: {},
    value: {
        color: theme.palette.maskColor.main,
        marginLeft: theme.spacing(1.5),
        fontSize: 14,
        fontWeight: 700,
        [`&.${refs.supply}`]: {
            color: theme.palette.maskColor.success,
        },
        [`&.${refs.withdraw}`]: {
            color: theme.palette.maskColor.danger,
        },
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isLiquidityFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.LiquidityFeed {
    return feed.tag === Tag.Exchange && feed.type === Type.Liquidity
}

interface TokenFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.LiquidityFeed
}

/**
 * LiquidityCard.
 * Including:
 *
 * - TokenIn
 * - TokenOut
 * - UnknownBurn
 */
export const LiquidityCard = ({ feed, className, ...rest }: TokenFeedCardProps) => {
    const { verbose } = rest
    const t = useI18N()
    const { classes, cx } = useStyles()

    const owner = useFeedOwner()
    const user = useAddressLabel(owner.address)

    // You might see two transaction actions in a liquidity feed as well
    const actions = feed.actions.filter((x) => x.tag === Tag.Exchange)

    return (
        <>
            {actions.map((action) => {
                const metadata = action.metadata
                const isUp = !!metadata?.action && ['supply', 'add', 'repay', 'collect'].includes(metadata?.action)

                return (
                    <CardFrame
                        key={`${feed.hash}/${action.index}`}
                        type={CardType.TokenLiquidity}
                        feed={feed}
                        className={cx(className, verbose ? classes.verbose : null)}
                        {...rest}>
                        <Typography className={classes.summary}>
                            <Translate.liquidity
                                values={{
                                    user,
                                    platform: feed.platform!,
                                    context: metadata?.action!,
                                }}
                                components={{
                                    user: <Label title={action.address_from} />,
                                    platform: <Label />,
                                    bold: <Label />,
                                }}
                            />
                        </Typography>
                        {metadata?.tokens.length ? (
                            <div className={classes.horizonCenter}>
                                <div className={classes.tokenList}>
                                    {metadata.tokens.map((token) => (
                                        <div key={token.contract_address} className={classes.token}>
                                            <Image
                                                classes={{ container: classes.tokenIcon }}
                                                src={resolveResourceURL(token.image)}
                                                height={40}
                                                width={40}
                                            />
                                            <Typography
                                                className={cx(classes.value, isUp ? classes.supply : classes.withdraw)}>
                                                {isUp ? '+ ' : '- '}
                                                {t.token_value({
                                                    value: formatValue(token),
                                                    symbol: token.symbol,
                                                })}
                                            </Typography>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </CardFrame>
                )
            })}
        </>
    )
}
