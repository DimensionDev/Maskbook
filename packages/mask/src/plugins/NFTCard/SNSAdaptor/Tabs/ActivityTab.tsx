import { makeStyles } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { NonFungibleTokenEvent, Pageable } from '@masknet/web3-shared-base'
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

export interface ActivityTabProps {
    events: AsyncState<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>>
}

export function ActivityTab(props: ActivityTabProps) {
    const { classes } = useStyles()

    return <div className={classes.wrapper}>events</div>
}
