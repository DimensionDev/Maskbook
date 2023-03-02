import { makeStyles } from '@masknet/theme'
import { Skeleton, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type NonFungibleTokenOrder, formatBalance, formatCurrency, isZero } from '@masknet/web3-shared-base'
import { useI18N } from '../../locales/i18n_generated.js'
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
        color: theme.palette.maskColor.publicSecond,
        '& > strong': {
            color: theme.palette.maskColor.publicMain,
            margin: '0 2px',
        },
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
    topOffer?: NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function PriceCard(props: PriceCardProps) {
    const { topOffer } = props
    const { setSourceType, sourceType, orders } = Context.useContainer()
    const t = useI18N()
    const { classes } = useStyles()

    if (!topOffer && orders.error)
        return (
            <div className={classes.wrapper}>
                <div className={classes.priceZone}>
                    <div className={classes.offerBox}>
                        <Typography textAlign="center" fontSize={12} fontWeight={700}>
                            {t.load_failed()}
                        </Typography>
                    </div>
                    <SourceProviderSwitcher selected={sourceType} onSelect={setSourceType} />
                </div>
            </div>
        )

    if (!topOffer && !orders.loading)
        return (
            <div className={classes.wrapper}>
                <div className={classes.priceZone}>
                    <div className={classes.offerBox}>
                        <Typography textAlign="left" fontSize={12} fontWeight={700}>
                            {t.plugin_collectible_nft_offers_switch_source()}
                        </Typography>
                    </div>
                    <SourceProviderSwitcher selected={sourceType} onSelect={setSourceType} />
                </div>
            </div>
        )

    const priceUSD = formatCurrency(topOffer?.price?.usd ?? 0, 'USD', { onlyRemainTwoDecimal: true })

    return (
        <div className={classes.wrapper}>
            <div className={classes.priceZone}>
                {orders.loading ? (
                    <PriceLoadingSkeleton />
                ) : (
                    <div className={classes.offerBox}>
                        {(topOffer?.priceInToken?.token.logoURL && (
                            <img width={18} height={18} src={topOffer.priceInToken.token.logoURL} alt="" />
                        )) ||
                            (topOffer?.priceInToken?.token.symbol.toUpperCase() === 'WETH' ? (
                                <Icons.WETH size={18} />
                            ) : (
                                <Typography className={classes.fallbackSymbol}>
                                    {topOffer?.priceInToken?.token.symbol || topOffer?.priceInToken?.token.name}
                                </Typography>
                            ))}
                        <Typography className={classes.textBase}>
                            <strong style={{ fontSize: '18px', lineHeight: '18px' }}>
                                {formatBalance(
                                    topOffer?.priceInToken?.amount,
                                    topOffer?.priceInToken?.token.decimals || 18,
                                    6,
                                )}
                            </strong>
                        </Typography>
                        {topOffer?.price?.usd && (
                            <Typography className={classes.textBase}>
                                ({priceUSD.includes('<') || isZero(topOffer?.price?.usd) ? '' : '\u2248'}
                                {priceUSD})
                            </Typography>
                        )}
                    </div>
                )}
                <SourceProviderSwitcher selected={sourceType} onSelect={setSourceType} />
            </div>
        </div>
    )
}

function PriceLoadingSkeleton() {
    return (
        <Stack gap={0.5} direction="row">
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
