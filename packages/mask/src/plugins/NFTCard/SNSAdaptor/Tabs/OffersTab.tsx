import { makeStyles } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { NonFungibleTokenOrder, Pageable } from '@masknet/web3-shared-base'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxHeight: '90%',
    },
}))

export interface OffersTabProps {
    offers: AsyncState<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
}

export function OffersTab(props: OffersTabProps) {
    const { offers } = props
    console.log(offers, 'sss')
    const { classes } = useStyles()
    return <div className={classes.wrapper}>orders</div>
}
