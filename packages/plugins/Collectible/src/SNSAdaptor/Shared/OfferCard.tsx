import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { NonFungibleTokenOrder, formatBalance, formatCurrency, isValidTimestamp } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Icons } from '@masknet/icons'
import { TokenIcon } from '@masknet/shared'
import { CollectibleProviderIcon } from './CollectibleProviderIcon.js'
import { useI18N } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: 8,
        boxSizing: 'border-box',
        gap: 12,
        borderRadius: 8,
        // there is no public bg have to hardcode
        background: '#fff',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    offerDetail: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    flex: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    },
    textBase: {
        fontSize: 12,
        color: theme.palette.maskColor.publicSecond,
        '& > strong': {
            color: theme.palette.maskColor.publicMain,
        },
    },
    symbol: {
        marginLeft: theme.spacing(0.2),
    },
    fallbackSymbol: {
        color: theme.palette.maskColor.publicMain,
        fontWeight: 700,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'flex-end',
    },
}))

export interface OfferCardProps {
    offer: NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function OfferCard(props: OfferCardProps) {
    const { offer } = props
    const { classes } = useStyles()
    const { Others } = useWeb3State()
    const t = useI18N()

    const renderTokenIcon = () => {
        if (offer.priceInToken?.token.logoURL)
            return <img width={18} height={18} src={offer.priceInToken?.token.logoURL} alt="" />

        if (offer.priceInToken?.token.symbol.toUpperCase() === 'WETH') return <Icons.WETH size={18} />

        return offer.priceInToken?.token.address ? (
            <TokenIcon
                name={offer.priceInToken.token.name}
                symbol={offer.priceInToken.token.symbol}
                address={offer.priceInToken.token.address}
                AvatarProps={{
                    style: {
                        width: 18,
                        height: 18,
                        fontSize: 12,
                    },
                }}
            />
        ) : (
            <Typography className={classes.fallbackSymbol}>
                {offer.priceInToken?.token.symbol || offer.priceInToken?.token.name}
            </Typography>
        )
    }

    return (
        <div className={classes.wrapper}>
            {offer.source ? <CollectibleProviderIcon active={false} provider={offer.source} /> : null}
            <div className={classes.offerDetail}>
                <div className={classes.flex}>
                    {renderTokenIcon()}
                    <div className={classes.flex}>
                        <Typography className={classes.textBase}>
                            <strong>
                                {formatBalance(offer.priceInToken?.amount, offer.priceInToken?.token.decimals || 18, 6)}
                            </strong>
                            {offer.priceInToken ? (
                                <span className={classes.symbol}>{offer.priceInToken?.token.symbol}</span>
                            ) : null}
                        </Typography>
                        {offer.price?.usd && (
                            <Typography className={classes.textBase} fontSize={12}>
                                <strong>{formatCurrency(offer.price.usd)}</strong>
                            </Typography>
                        )}
                    </div>
                </div>
                <div className={classes.flex}>
                    <Typography className={classes.textBase}>{t.plugin_collectible_from()}</Typography>

                    <Typography className={classes.textBase} style={{ marginRight: 6 }}>
                        {offer.maker?.address ? (
                            <strong style={{ margin: '0px 4px' }}>
                                {Others?.formatAddress(offer.maker.address, 4)}
                            </strong>
                        ) : (
                            '-'
                        )}
                    </Typography>

                    <Typography className={classes.textBase}>
                        {isValidTimestamp(offer.createdAt)
                            ? formatDistanceToNow(Math.ceil(offer.createdAt!), {
                                  addSuffix: true,
                              })
                            : '-'}
                        {isValidTimestamp(offer.expiredAt) && (
                            <>
                                <span style={{ margin: '0 4px' }}>{t.plugin_collectible_expires_in()}</span>
                                {formatDistanceToNow(Math.ceil(offer.expiredAt!), {
                                    addSuffix: true,
                                })}
                            </>
                        )}
                    </Typography>
                </div>
            </div>
        </div>
    )
}
