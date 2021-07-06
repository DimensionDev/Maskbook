import { makeStyles, Theme } from '@material-ui/core'
import { useI18N } from '../../../utils'
import { HIDE_COMMUNITY_POOL } from '../constants'
import type { Pool } from '../types'
import { PoolView } from './PoolView'

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex',
        position: 'relative',
        padding: theme.spacing(0.5),
        justifyContent: 'center',
        flexDirection: 'column',
    },
}))

interface PoolsProps {
    pools: [Pool]
}

export function PoolsView(props: PoolsProps) {
    const { pools } = props

    const classes = useStyles()
    const { t } = useI18N()

    return (
        <div className={classes.root}>
            {pools
                .filter((pool) => (HIDE_COMMUNITY_POOL ? !pool.contract.isCommunityPool : true))
                .sort((x, y) => Number(y.prize.weeklyTotalValueUsd) - Number(x.prize.weeklyTotalValueUsd))
                .map((pool) => (
                    <PoolView key={pool.prizePool.address} pool={pool} />
                ))}
        </div>
    )
}
