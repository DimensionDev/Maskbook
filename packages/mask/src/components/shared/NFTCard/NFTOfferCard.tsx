import { makeStyles } from '@masknet/theme'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { Typography } from '@mui/material'
import {
    NonFungibleTokenOrder,
    formatBalance,
    formatCurrency,
    NetworkPluginID,
    isValidTimestamp,
} from '@masknet/web3-shared-base'
import { useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { useI18N } from '../../../utils'
import { CollectibleProviderIcon } from '../../../plugins/Collectible/SNSAdaptor/CollectibleProviderIcon'
import { Icons } from '@masknet/icons'

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
    currencyIcon: {
        width: 24,
        height: 24,
    },
    symbol: {
        marginLeft: theme.spacing(0.2),
    },
    fallbackSymbol: {
        color: theme.palette.maskColor.publicMain,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'flex-end',
    },
}))

export interface NFTOfferCardProps {
    offer: NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function NFTOfferCard(props: NFTOfferCardProps) {
    const { offer } = props
    const { classes } = useStyles()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { t } = useI18N()

    return (
        <div className={classes.wrapper}>
            {offer.source ? <CollectibleProviderIcon active={false} provider={offer.source} /> : null}
            <div className={classes.offerDetail}>
                <div className={classes.flex}>
                    {(offer.priceInToken?.token.logoURL && (
                        <img width={18} height={18} src={offer.priceInToken?.token.logoURL} alt="" />
                    )) ||
                        (offer.priceInToken?.token.symbol.toUpperCase() === 'WETH' ? (
                            <Icons.WETH size={18} />
                        ) : (
                            <Typography className={classes.fallbackSymbol}>
                                {offer.priceInToken?.token.symbol || offer.priceInToken?.token.name}
                            </Typography>
                        ))}
                    <div className={classes.flex}>
                        <Typography className={classes.textBase}>
                            <strong style={{ fontSize: 14 }}>
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
                    <Typography className={classes.textBase}>{t('plugin_collectible_from')}</Typography>

                    <Typography className={classes.textBase} style={{ marginRight: 6 }}>
                        {(offer.maker?.address && (
                            <strong style={{ fontSize: 14, margin: '0px 4px' }}>
                                {Others?.formatAddress(offer.maker.address, 4)}
                            </strong>
                        )) ||
                            '-'}
                    </Typography>

                    <Typography className={classes.textBase}>
                        {(isValidTimestamp(offer.createdAt) &&
                            formatDistanceToNow(Math.ceil(offer.createdAt!), {
                                addSuffix: true,
                            })) ||
                            '-'}
                        {isValidTimestamp(offer.expiredAt) && (
                            <>
                                <span style={{ margin: '0 4px' }}>{t('plugin_collectible_expires_in')}</span>
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
