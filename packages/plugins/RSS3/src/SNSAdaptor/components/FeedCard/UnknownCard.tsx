import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { useFeedOwner } from '../../contexts/index.js'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.danger,
    },
}))

interface TokenFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.Web3Feed
}

export const UnknownCard: FC<TokenFeedCardProps> = ({ feed, ...rest }) => {
    const { classes } = useStyles()

    const action = feed.actions[0]

    const owner = useFeedOwner()
    const isFromOwner = isSameAddress(owner.address, action.address_from)

    const cardType = isFromOwner ? CardType.UnknownOut : CardType.UnknownIn

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                Unknown feed. Tag: {feed.tag}, Type: {feed.type}, {feed.actions.length} actions
            </Typography>
        </CardFrame>
    )
}
