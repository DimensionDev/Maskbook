import { formatDistanceToNow } from 'date-fns'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { type NonFungibleTokenOrder, formatBalance, formatCurrency, isValidTimestamp } from '@masknet/web3-shared-base'
import { FormattedCurrency, TokenIcon } from '@masknet/shared'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Icons } from '@masknet/icons'
import { memo, type HTMLProps } from 'react'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    card: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: 8,
        boxSizing: 'border-box',
        gap: 12,
        borderRadius: 8,
        // there is no public bg have to hardcode
        background: theme.palette.mode === 'dark' ? theme.palette.maskColor.bg : '#fff',
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
        fontSize: 14,
        color: theme.palette.maskColor.second,
        '& > strong': {
            color: theme.palette.maskColor.main,
        },
    },
    fallbackSymbol: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'flex-end',
    },
}))

interface OfferCardProps extends HTMLProps<HTMLDivElement> {
    offer: NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export const OfferCard = memo(function OfferCard({ offer, ...rest }: OfferCardProps) {
    const { classes, cx } = useStyles()
    const Utils = useWeb3Utils()

    const renderTokenIcon = () => {
        if (offer.priceInToken?.token.logoURL)
            return <img width={20} height={20} src={offer.priceInToken?.token.logoURL} alt="" />

        // eslint-disable-next-line react/naming-convention/component-name
        if (offer.priceInToken?.token.symbol.toUpperCase() === 'WETH') return <Icons.WETH size={18} />

        return offer.priceInToken?.token.address ?
                <TokenIcon
                    name={offer.priceInToken.token.name}
                    symbol={offer.priceInToken.token.symbol}
                    address={offer.priceInToken.token.address}
                    size={20}
                    style={{
                        fontSize: 14,
                    }}
                />
            :   <Typography className={classes.fallbackSymbol}>
                    {offer.priceInToken?.token.symbol || offer.priceInToken?.token.name}
                </Typography>
    }

    return (
        <div {...rest} className={cx(classes.card, rest.className)}>
            <div className={classes.offerDetail}>
                <div className={classes.flex}>
                    {renderTokenIcon()}
                    <div className={classes.flex}>
                        <Typography className={classes.textBase}>
                            <strong>
                                {formatBalance(offer.priceInToken?.amount, offer.priceInToken?.token.decimals || 18, {
                                    significant: 6,
                                })}
                            </strong>
                        </Typography>
                        {offer.price?.usd ?
                            <Typography className={classes.textBase} fontSize={12}>
                                <strong>
                                    <FormattedCurrency value={offer.price.usd} formatter={formatCurrency} />
                                </strong>
                            </Typography>
                        :   null}
                    </div>
                </div>
                <div className={classes.flex}>
                    <Typography className={classes.textBase}>
                        <Trans>From</Trans>
                    </Typography>

                    <Typography className={classes.textBase} style={{ marginRight: 6, fontSize: '12px' }}>
                        {offer.maker?.address ?
                            <strong style={{ margin: '0px 4px' }}>{Utils.formatAddress(offer.maker.address, 4)}</strong>
                        :   '-'}
                    </Typography>

                    <Typography className={classes.textBase}>
                        {isValidTimestamp(offer.createdAt) ?
                            formatDistanceToNow(Math.ceil(offer.createdAt!), {
                                addSuffix: true,
                            })
                        :   '-'}
                        {isValidTimestamp(offer.expiredAt) && (
                            <Trans>
                                <span style={{ margin: '0 4px' }}>Expires in </span>
                                {formatDistanceToNow(Math.ceil(offer.expiredAt!), {
                                    addSuffix: true,
                                })}
                            </Trans>
                        )}
                    </Typography>
                </div>
            </div>
        </div>
    )
})
