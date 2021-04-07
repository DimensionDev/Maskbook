import { useCallback } from 'react'
import { makeStyles, createStyles, Button, Typography } from '@material-ui/core'
import { OrderSide, WyvernSchemaName } from 'opensea-js/lib/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { CollectibleState } from '../hooks/useCollectibleState'
import { useOrders } from '../hooks/useOrders'
import { PluginCollectibleRPC } from '../messages'
import { CollectibleTab } from './CollectibleTab'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            width: '100%',
            height: '100%',
        },
        content: {},
    })
})

export interface OfferTabProps {}

export function OfferTab(props: OfferTabProps) {
    const classes = useStyles()

    const { token } = CollectibleState.useContainer()
    const account = useAccount()
    const offers = useOrders(token, OrderSide.Buy)

    console.log({
        offers,
    })

    const onCreateClicked = useCallback(async () => {
        if (!token) return
        const order = await PluginCollectibleRPC.creteBuyOrder(
            token.contractAddress,
            token.tokenId,
            WyvernSchemaName.ERC721,
            account,
        )
        console.log(order)
    }, [token])

    return (
        <CollectibleTab>
            <Typography>This is the offer tab.</Typography>
            <Button onClick={onCreateClicked}>Create Offer</Button>
        </CollectibleTab>
    )
}
