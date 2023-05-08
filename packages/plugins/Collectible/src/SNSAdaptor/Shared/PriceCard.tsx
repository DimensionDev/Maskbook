import { makeStyles } from '@masknet/theme'
import { Skeleton, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useI18N } from '../../locales/i18n_generated.js'
import { type NonFungibleTokenOrder, formatBalance, formatCurrency, isZero } from '@masknet/web3-shared-base'
import { SourceProviderSwitcher } from '@masknet/shared'
import { Context } from '../Context/index.js'
import { Stack } from '@mui/system'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        color: theme.palette.maskColor.publicMain,
        width: '100%',
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF',
        padding: 12,
        boxSizing: 'border-box',
        borderRadius: 12,
    },
    textBase: {
        fontSize: 14,
        color: theme.palette.maskColor.publicMain,
        '& > strong': {
            margin: '0 1px',
        },
        lineHeight: 1,
    },
    priceZone: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 0.5,
        width: '100%',
    },
    offerBox: {
        display: 'flex',
        gap: 4,
        alignItems: 'center',
    },
    fallbackSymbol: {
        color: theme.palette.maskColor.publicMain,
        fontWeight: 700,
        fontSize: 16,
        lineHeight: '20px',
        display: 'flex',
        alignItems: 'flex-end',
    },
}))

export interface PriceCardProps {
    topListing?: NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function PriceCard(props: PriceCardProps) {
    const { topListing } = props
    const { setSourceType, sourceType, orders } = Context.useContainer()
    const t = useI18N()
    const { classes } = useStyles()
    console.log({ orders, sourceType })
    if (((!topListing && orders.error) || orders.loading) && !sourceType) return null

    if (!topListing && !orders.loading)
        return sourceType ? (
            <div className={classes.wrapper}>
                <div className={classes.priceZone}>
                    <div className={classes.offerBox}>
                        <Typography textAlign="left" fontSize={14} fontWeight={400}>
                            {t.plugin_collectible_no_listings()}
                        </Typography>
                    </div>
                    {sourceType ? <SourceProviderSwitcher selected={sourceType} onSelect={setSourceType} /> : null}
                </div>
            </div>
        ) : null

    const priceUSD = formatCurrency(topListing?.price?.usd ?? 0, 'USD', { onlyRemainTwoDecimal: true })

    return (
        <div className={classes.wrapper}>
            <div className={classes.priceZone}>
                {orders.loading ? (
                    <PriceLoadingSkeleton />
                ) : (
                    <div className={classes.offerBox}>
                        {topListing?.priceInToken?.token.symbol.toUpperCase() === 'ETH' ? (
                            <Icons.ETH size={18} />
                        ) : (
                            (topListing?.priceInToken?.token.logoURL && (
                                <img width={18} height={18} src={topListing.priceInToken.token.logoURL} alt="" />
                            )) ||
                            (topListing?.priceInToken?.token.symbol.toUpperCase() === 'WETH' ? (
                                <Icons.WETH size={18} />
                            ) : (
                                <Typography className={classes.fallbackSymbol}>
                                    {topListing?.priceInToken?.token.symbol || topListing?.priceInToken?.token.name}
                                </Typography>
                            ))
                        )}
                        <Typography className={classes.textBase}>
                            <strong style={{ fontSize: '18px', lineHeight: '18px' }}>
                                {formatBalance(
                                    topListing?.priceInToken?.amount,
                                    topListing?.priceInToken?.token.decimals || 18,
                                    6,
                                )}
                            </strong>
                        </Typography>
                        {topListing?.price?.usd ? (
                            <Typography className={classes.textBase}>
                                ({priceUSD.includes('<') || isZero(topListing?.price?.usd) ? '' : '\u2248'}
                                {priceUSD})
                            </Typography>
                        ) : null}
                    </div>
                )}
                {topListing?.source ? (
                    <SourceProviderSwitcher selected={topListing?.source} onSelect={setSourceType} />
                ) : null}
            </div>
        </div>
    )
}

function PriceLoadingSkeleton() {
    return (
        <Stack gap={0.5} direction="row" height={24} alignItems="center">
            <Skeleton variant="circular" animation="wave" sx={{ bgColor: 'grey.100' }} width={18} height={18} />
            <Skeleton
                variant="rectangular"
                animation="wave"
                sx={{ borderRadius: '2px', bgColor: 'grey.100' }}
                width={88}
                height={18}
            />
        </Stack>
    )
}
