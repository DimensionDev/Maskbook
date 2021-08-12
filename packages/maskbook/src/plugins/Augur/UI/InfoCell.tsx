import { formatBalance } from '@masknet/web3-shared'
import { Grid, Typography } from '@material-ui/core'
import { rawToFixed } from '../utils'

interface InfoCellProps {
    title: string
    value: string
    symbol: string
    decimals: number
    precision: number
}

export const InfoCell = (props: InfoCellProps) => {
    const { title, value, decimals, precision, symbol } = props
    const formattedValue = formatBalance(rawToFixed(value.toString(), decimals, precision), decimals)
    const displayValue = formattedValue !== '0' ? formattedValue + ' ' + symbol : '-'
    console.log(value)
    return (
        <Grid item container direction="column" justifyContent="center">
            <Grid item>
                <Typography variant="body2" color="textSecondary" align="center">
                    {title}
                </Typography>
            </Grid>
            <Grid item>
                <Typography variant="body2" align="center">
                    {displayValue}
                </Typography>
            </Grid>
        </Grid>
    )
}
