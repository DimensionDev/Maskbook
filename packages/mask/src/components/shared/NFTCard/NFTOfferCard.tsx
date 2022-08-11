import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { NonFungibleTokenOrder, SourceType } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
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
        background: theme.palette.maskColor.bottom,
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
        color: theme.palette.text.secondary,
        '& > strong': {
            color: theme.palette.text.primary,
        },
    },
    currencyIcon: {
        width: 24,
        height: 24,
    },
}))

interface NFTOfferCardProps {
    offer: NonFungibleTokenOrder<ChainId, SchemaType>
    provider: SourceType
}

export function NFTOfferCard(props: NFTOfferCardProps) {
    const { offer, provider } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    return (
        <div className={classes.wrapper}>
            <CollectibleProviderIcon provider={provider} />
            <div className={classes.offerDetail}>
                <div className={classes.flex}>
                    <img className={classes.currencyIcon} src={offer.priceInToken?.token.logoURL} alt="" />
                    <Typography className={classes.textBase}>
                        <strong style={{ fontSize: 14 }}>{offer.priceInToken?.amount}</strong>{' '}
                        <strong>{offer.price?.usd || '-'}</strong>
                    </Typography>
                </div>
                <div className={classes.flex} style={{ marginLeft: 40 }}>
                    <Typography className={classes.textBase}>
                        {t('plugin_collectible_from')} <strong style={{ fontSize: 14 }}>{offer.maker?.address}</strong>{' '}
                        {offer.createdAt} {t('plugin_collectible_expires_in')} {offer.expiredAt}
                    </Typography>
                </div>
            </div>
        </div>
    )
}
