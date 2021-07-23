import { makeStyles, Theme } from '@material-ui/core'
import { useI18N } from '../../../utils'
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
    pools: Pool[]
}

export function PoolsView(props: PoolsProps) {
    const { pools } = props

    const classes = useStyles()
    const { t } = useI18N()

    return (
        <div className={classes.root}>
            {pools.map((pool) => (
                <PoolView key={pool.prizePool.address} pool={pool} />
            ))}
        </div>
    )
}
