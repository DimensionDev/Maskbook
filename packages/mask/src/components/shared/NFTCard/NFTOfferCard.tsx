import { makeStyles } from '@masknet/theme'
import { OpenSeaIcon } from '../../../resources/OpenSeaIcon'
import { Typography } from '@mui/material'
import { ETHIcon } from '../../../plugins/VCent/icons/ETH'
import type { NonFungibleTokenOrder } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

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
}

export function NFTOfferCard(props: NFTOfferCardProps) {
    const { offer } = props
    const { classes } = useStyles()
    // if (!offer.value || offer.loading) return <Skeleton width="100%" height={60} />

    return (
        <div className={classes.wrapper}>
            <OpenSeaIcon width={24} height={24} />
            <div className={classes.offerDetail}>
                <div className={classes.flex}>
                    {<img className={classes.currencyIcon} src="" alt="" /> || <ETHIcon width={20} height={20} />}
                    <Typography className={classes.textBase}>
                        <strong style={{ fontSize: 14 }}>{offer.priceInToken?.amount}</strong>{' '}
                        <strong>{offer.price?.usd || '-'}</strong> - below
                    </Typography>
                </div>
                <div className={classes.flex} style={{ marginLeft: 40 }}>
                    <Typography className={classes.textBase}>
                        From <strong style={{ fontSize: 14 }}>{offer.maker?.address}</strong> {offer.createdAt} Expires
                        in {offer.expiredAt}
                    </Typography>
                </div>
            </div>
        </div>
    )
}
