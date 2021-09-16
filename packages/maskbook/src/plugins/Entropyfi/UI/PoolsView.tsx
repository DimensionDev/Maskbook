import { makeStyles } from '@masknet/theme'
import { poolAddressMap } from '../constants'
import { getSlicePoolId } from '../utils'
import { PoolView } from './PoolView'
import { useChainId } from '@masknet/web3-shared'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        position: 'relative',
        padding: theme.spacing(0.5),
        justifyContent: 'center',
        flexDirection: 'column',
    },
}))

export function PoolsView() {
    const { classes } = useStyles()
    const [PoolIDs, SelectorList] = GETDATA()
    return (
        <div className={classes.root}>
            {PoolIDs.map((item: any, index: number) => {
                return <PoolView key={index} poolId={item.PoolId} />
            })}
        </div>
    )
}

//=> Functions
const GETDATA = (): Array<any> => {
    const chainId = useChainId()
    console.log('CHAIND ID', chainId)
    const PoolIDs = []
    const SelectorList = [{ name: 'ALL' }]
    for (const poolId of Object.keys(poolAddressMap[chainId])) {
        const [COIN] = getSlicePoolId(poolId)

        if (poolId === 'BTC-USDT' || poolId === 'BTC-USDC' || poolId === 'BTC-DAI') {
            PoolIDs.push({ PoolId: poolId, coin: COIN }) //, address: poolAddressMap[chainId][poolId]

            // const selsectFilter = SelectorConstants.filter((item: any) => item.name === COIN)
            // if (selsectFilter.length > 0 && !SelectorList.includes(selsectFilter[0]))
            //     SelectorList.push(selsectFilter[0])
        }
    }

    return [PoolIDs, SelectorList]
}
