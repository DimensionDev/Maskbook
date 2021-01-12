import { CircularProgress, createStyles, makeStyles, Typography } from '@material-ui/core'
import { red } from '@material-ui/core/colors'
import type { GasPrice } from '../../plugins/Wallet/types'
import { useGasPrice } from '../hooks/useGasPrice'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        price: {
            color: red[100],
        },
        line: {
            borderLeft: '1px solid rgba(224, 224, 224, 1)',
        },
    }),
)
export interface SelectGasPriceDialogProps {}

export function SelectGasPriceDialog(props: SelectGasPriceDialogProps) {
    const { loading, value: gasPrices } = useGasPrice()
    const classes = useStyles()

    if (loading)
        return (
            <div>
                <CircularProgress />
            </div>
        )
    return (
        <>
            {gasPrices?.map((item: GasPrice, idx: number) => (
                <div className={classes.root}>
                    <div className={classes.line}>
                        <Typography variant="h5" className="price">
                            {item.gasPrice}
                        </Typography>
                    </div>
                    <Typography variant="h6">{item.title}</Typography>
                    <Typography variant="body1" color="textSecondary">
                        &lt;
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        {item.wait}S
                    </Typography>
                </div>
            ))}
        </>
    )
}
