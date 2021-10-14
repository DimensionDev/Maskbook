import React, { useCallback } from 'react'
import type { Nft, Metadata } from '../types'
import { CardHeader, Link, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils'

interface Props extends React.PropsWithChildren<{}> {
    nft: Nft
    metadata: Metadata
    link: string
}

function FoundationHeader(props: Props) {
    const { t } = useI18N()

    const CurrentPrice = useCallback(() => {
        if (props.nft.mostRecentAuction) {
            if (props.nft.mostRecentAuction.highestBid) {
                return `${t('plugin_foundation_highest')} ${props.nft.mostRecentAuction.highestBid.amountInETH}`
            }
            return `${t('plugin_foundation_reserve')} ${props.nft.mostRecentAuction.reservePriceInETH}`
        }
        return null
    }, [])

    return (
        <CardHeader
            title={
                <Link color="inherit" target="_blank" rel="noopener noreferrer" href={props.link}>
                    <Typography variant="h3" align="center">
                        {props.metadata?.name}
                    </Typography>
                </Link>
            }
            subheader={
                <Typography variant="h5" align="center" color="text.secondary">
                    {CurrentPrice()}
                </Typography>
            }
        />
    )
}

export default FoundationHeader
