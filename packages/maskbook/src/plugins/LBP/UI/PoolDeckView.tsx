import { Typography } from '@material-ui/core'
import { useEffect } from 'react'
import type { TagType } from '../../Trader/types'
import { PriceChart } from './PriceChart'

export interface PoolDeckViewProps {
    name: string
    tagType: TagType
    onUpdate?: () => void
}

export function PoolDeckView(props: PoolDeckViewProps) {
    //#region api ready callback
    useEffect(() => {
        props.onUpdate?.()
    }, [])
    //#endregion

    return (
        <Typography color="textPrimary">
            Hit! {props.name} LBP.
            <PriceChart />
        </Typography>
    )
}
