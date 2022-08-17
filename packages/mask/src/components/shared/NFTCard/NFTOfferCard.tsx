import { makeStyles } from '@masknet/theme'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { Typography } from '@mui/material'
import { NonFungibleTokenOrder, SourceType, formatBalance } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { useI18N } from '../../../utils'
import { CollectibleProviderIcon } from '../../../plugins/Collectible/SNSAdaptor/CollectibleProviderIcon'

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
        gap: 10,
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
    fallbackSymbol: {
        color: theme.palette.maskColor.publicMain,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'flex-end',
    },
}))

interface NFTOfferCardProps {
    offer: NonFungibleTokenOrder<ChainId, SchemaType>
    provider: SourceType
}

export function NFTOfferCard(props: NFTOfferCardProps) {
    const { offer, provider } = props
    const { classes } = useStyles()
    const { Others } = useWeb3State()
    const { t } = useI18N()
    console.log(offer, 'offer')
    return (
        <div className={classes.wrapper}>
            <CollectibleProviderIcon active={false} provider={provider} />
            <div className={classes.offerDetail}>
                <div className={classes.flex}>
                    {(offer.priceInToken?.token.logoURL && (
                        <img className={classes.currencyIcon} src={offer.priceInToken?.token.logoURL} alt="" />
                    )) || (
                        <Typography className={classes.fallbackSymbol}>
                            {offer.priceInToken?.token.symbol || offer.priceInToken?.token.name}
                        </Typography>
                    )}
                    <div className={classes.flex}>
                        <Typography className={classes.textBase}>
                            <strong style={{ fontSize: 14 }}>
                                {formatBalance(offer.priceInToken?.amount, offer.priceInToken?.token.decimals || 18)}
                            </strong>
                        </Typography>
                        {offer.price?.usd && (
                            <Typography className={classes.textBase} fontSize={12}>
                                <strong>${offer.price.usd}</strong>
                            </Typography>
                        )}
                    </div>
                </div>
                <div className={classes.flex} style={{ marginLeft: 40 }}>
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
                        {(offer.createdAt &&
                            formatDistanceToNow(new Date(offer.createdAt * 1000), {
                                addSuffix: true,
                            })) ||
                            '-'}
                        <span style={{ margin: '0 4px' }}>{t('plugin_collectible_expires_in')}</span>
                        {(offer.expiredAt &&
                            formatDistanceToNow(new Date(offer.expiredAt * 1000), {
                                addSuffix: true,
                            })) ||
                            '-'}
                    </Typography>
                </div>
            </div>
        </div>
    )
}
