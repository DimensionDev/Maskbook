import { LoadingBase, makeStyles } from '@masknet/theme'
import { Skeleton, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useCollectibleTrans } from '../../locales/i18n_generated.js'
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
    skeleton: {
        backgroundColor: theme.palette.maskColor.publicLine,
    },
}))

interface PriceCardProps {
    topListing?: NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function PriceCard({ topListing }: PriceCardProps) {
    const { setSourceType, sourceType = topListing?.source, orders } = Context.useContainer()
    const t = useCollectibleTrans()
    const { classes } = useStyles()
    if (((!topListing && orders.error) || orders.isPending) && !sourceType) return null

    if (!topListing && !orders.isPending)
        return sourceType ?
                <div className={classes.wrapper}>
                    <div className={classes.priceZone}>
                        <div className={classes.offerBox}>
                            <Typography textAlign="left" fontSize={14} fontWeight={400}>
                                {t.plugin_collectible_no_listings()}
                            </Typography>
                        </div>
                        {sourceType ?
                            <SourceProviderSwitcher selected={sourceType} onSelect={setSourceType} />
                        :   null}
                    </div>
                </div>
            :   null

    const priceUSD = formatCurrency(topListing?.price?.usd ?? 0, 'USD', { onlyRemainTwoOrZeroDecimal: true })

    const renderTokenSymbol = () => {
        const { symbol, logoURL } = topListing?.priceInToken?.token ?? {}
        // eslint-disable-next-line react/naming-convention/component-name
        if (symbol?.toUpperCase() === 'ETH') return <Icons.ETH size={18} />
        if (logoURL) return <img width={18} height={18} src={logoURL} alt="" />
        // eslint-disable-next-line react/naming-convention/component-name
        if (symbol?.toUpperCase() === 'WETH') return <Icons.WETH size={18} />

        return (
            <Typography className={classes.fallbackSymbol}>
                {topListing?.priceInToken?.token.symbol || topListing?.priceInToken?.token.name}
            </Typography>
        )
    }

    return (
        <div className={classes.wrapper}>
            <div className={classes.priceZone}>
                {orders.isPending ?
                    <PriceLoadingSkeleton />
                :   <div className={classes.offerBox}>
                        {renderTokenSymbol()}
                        <Typography className={classes.textBase}>
                            <strong style={{ fontSize: '18px', lineHeight: '18px' }}>
                                {formatBalance(
                                    topListing?.priceInToken?.amount,
                                    topListing?.priceInToken?.token.decimals || 18,
                                    { significant: 6 },
                                )}
                            </strong>
                        </Typography>
                        {topListing?.price?.usd ?
                            <Typography className={classes.textBase}>
                                ({priceUSD.includes('<') || isZero(topListing.price.usd) ? '' : '≈'}
                                {priceUSD})
                            </Typography>
                        :   null}
                    </div>
                }
                {sourceType ?
                    <SourceProviderSwitcher selected={sourceType} onSelect={setSourceType} />
                :   null}
            </div>
        </div>
    )
}

function PriceLoadingSkeleton() {
    const { classes } = useStyles()
    return (
        <Stack gap={0.5} direction="row" height={24} alignItems="center">
            <LoadingBase size={20} />
            <Skeleton
                variant="text"
                animation="wave"
                classes={{
                    root: classes.skeleton,
                }}
                width={88}
                height={18}
            />
        </Stack>
    )
}
