import { makeStyles } from '@masknet/theme'
import { useChainId } from '@masknet/web3-shared'
import { useI18N } from '../../../utils/i18n-next-ui'

const useStyles = makeStyles()((theme) => ({
    root: {
        border: `solid 1px ${theme.palette.divider}`,
    },
}))

interface PoolViewProps {
    category: string
    chainId: string
    address: string
}

export function FurucomboView(props: PoolViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const currentChaindId = useChainId()

    // const data = useFetchPools()
    // console.log('data: ', data)

    return <div className={classes.root}>FURUCOMBO View</div>
}
