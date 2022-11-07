import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { useI18N } from '../../../locales/index.js'
import { Translate } from '../../../locales/i18n_generated.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardType } from '../share.js'
import { CardFrame, FeedCardProps } from '../base.js'
import { formatValue, Label } from './common.js'

const useStyles = makeStyles<void, 'tokenIcon' | 'verboseToken' | 'supply' | 'withdraw'>()((theme, _, refs) => ({
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
export const LiquidityCard: FC<TokenFeedCardProps> = ({ feed, ...rest }) => {
    const { verbose } = rest
    const t = useI18N()
    const { classes, cx } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const owner = useFeedOwner()
    const user = useAddressLabel(owner.address)
    const targetToken = metadata?.tokens[0]

    const isSupply = metadata?.action === 'supply'
    const context = isSupply ? 'supply' : 'withdraw'

    return (
        <CardFrame type={CardType.TokenLiquidity} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <Translate.liquidity
                    values={{
                        user,
                        platform: feed.platform!,
                        context,
                    }}
                    components={{
                        user: <Label title={action.address_from!} />,
                        platform: <Label />,
                        bold: <Label />,
                    }}
                />
            </Typography>
            {targetToken ? (
                <div className={cx(classes.token, verbose ? classes.verboseToken : null)}>
                    <Image classes={{ container: classes.tokenIcon }} src={targetToken.image} height={40} width={40} />
                    <Typography className={cx(classes.value, isSupply ? classes.supply : classes.withdraw)}>
                        {isSupply ? '+ ' : '- '}
                        {t.token_value({
                            value: formatValue(targetToken),
                            symbol: targetToken.symbol,
                        })}
                    </Typography>
                </div>
            ) : null}
        </CardFrame>
    )
}
