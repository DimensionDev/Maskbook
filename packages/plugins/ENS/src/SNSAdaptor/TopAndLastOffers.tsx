import { first, last } from 'lodash-unified'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useI18N } from '../locales'
import { NonFungibleTokenOrder, formatBalance, formatCurrency } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { CollectibleState } from './hooks/useCollectibleState'

const useStyles = makeStyles()((theme) => ({
    textBase: {
        fontSize: 14,
        color: theme.palette.maskColor.publicSecond,
        '& > strong': {
            color: theme.palette.maskColor.publicMain,
            margin: '0 2px',
        },
    },
    offerBox: {
        display: 'flex',
        alignItems: 'center',
        marginRight: 39,
        gap: 4,
    },
    fallbackSymbol: {
        color: theme.palette.maskColor.publicMain,
        fontWeight: 700,
        fontSize: 16,
        lineHeight: '20px',
        display: 'flex',
        alignItems: 'flex-end',
    },
    offerBoxWrapper: {
        display: 'flex',
        margin: '0px 12px 24px',
    },
}))

const resolveTopOrLastOffer = (
    orders?: Array<NonFungibleTokenOrder<ChainId, SchemaType>>,
    type: 'top' | 'last' = 'top',
) => {
    if (!orders || !orders.length) return
    const resolver = type === 'top' ? first : last
    return resolver(
        orders.sort((a, b) => {
            const value_a = new BigNumber(a.priceInToken?.amount ?? 0)
            const value_b = new BigNumber(b.priceInToken?.amount ?? 0)
            return Number(value_a.lt(value_b))
        }),
    )
}

export function TopAndLastOffers() {
    const { classes } = useStyles()
    const { orders } = CollectibleState.useContainer()
    const topOffer = resolveTopOrLastOffer(orders.value?.data, 'top')
    const lastOffer = resolveTopOrLastOffer(orders.value?.data, 'last')
    return topOffer ? (
        <div className={classes.offerBoxWrapper}>
            {topOffer ? <OfferBox offer={topOffer} type="top" /> : null}
            {lastOffer ? <OfferBox offer={lastOffer} type="last" /> : null}
        </div>
    ) : null
}

function OfferBox({ offer, type }: { offer: NonFungibleTokenOrder<ChainId, SchemaType>; type: 'top' | 'last' }) {
    const { classes } = useStyles()
    const t = useI18N()

    return (
        <div className={classes.offerBox}>
            <Typography className={classes.textBase}>{type === 'top' ? t.top_offer() : t.last_offer()}</Typography>
            {(offer.priceInToken?.token.logoURL && (
                <img width={18} height={18} src={offer.priceInToken?.token.logoURL} alt="" />
            )) ||
                (offer.priceInToken?.token.symbol.toUpperCase() === 'WETH' ? (
                    <Icons.WETH size={18} />
                ) : (
                    <Typography className={classes.fallbackSymbol} component="span">
                        {offer.priceInToken?.token.symbol || offer.priceInToken?.token.name}
                    </Typography>
                ))}
            <Typography className={classes.textBase}>
                <strong>
                    {formatBalance(offer?.priceInToken?.amount, offer?.priceInToken?.token.decimals || 18, 6)}
                </strong>
            </Typography>
            {offer.price?.usd && (
                <Typography className={classes.textBase}>
                    <strong>({formatCurrency(offer.price?.usd) || '-'})</strong>
                </Typography>
            )}
        </div>
    )
}
