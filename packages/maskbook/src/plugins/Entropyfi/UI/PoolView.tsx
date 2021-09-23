import { Grid } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useChainId } from '@masknet/web3-shared'
// import { usePoolState } from '../hooks/usePoolData'

import { CardButtom } from './Component/Card_buttom'
import { CardRight } from './Component/Card_Right'
import { CardLeft } from './Component/Card_Left'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1, 1),
        alignItems: 'stretch',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        margin: theme.spacing(1, 0),
        borderRadius: theme.spacing(3),
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        fontSize: 14,
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
    },
    root_top: {
        padding: theme.spacing(1, 1),
        alignItems: 'stretch',
        margin: theme.spacing(1, 0),
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        height: '160px',
    },
}))

export function PoolView(props: any) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const chainId = useChainId()

    // console.log('props.poolId:', props.poolId)
    // console.log('PoolView.chainId:', chainId)

    // const poolValue = new BigNumber(poolState.shortValue)

    return (
        <Grid container direction="column" className={classes.root}>
            <Grid container direction="row" className={classes.root_top}>
                <CardLeft poolId={props.poolId} />
                <CardRight poolId={props.poolId} />
            </Grid>
            <CardButtom poolId={props.poolId} />
        </Grid>
    )
}
