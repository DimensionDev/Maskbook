import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import type { Market } from '../../types'
import { PriceChanged } from './PriceChanged'

const useStyles = makeStyles()((theme) => ({
    container: {
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    table: {},
    cell: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1.5),
        textAlign: 'center',
        whiteSpace: 'nowrap',
    },
}))

type Record = {
    name: string
    percentage?: number
}

export interface PriceChangedTableProps {
    market: Market
}

export function PriceChangedTable({ market }: PriceChangedTableProps) {
    const { classes } = useStyles()
    const records: Record[] = [
        {
            name: '1h',
            percentage: market.price_change_percentage_1h_in_currency,
        },
        {
            name: '24h',
            percentage: market.price_change_percentage_24h_in_currency,
        },
        {
            name: '7d',
            percentage: market.price_change_percentage_7d_in_currency,
        },
        {
            name: '14d',
            percentage: market.price_change_percentage_14d_in_currency,
        },
        {
            name: '30d',
            percentage: market.price_change_percentage_30d_in_currency,
        },
        {
            name: '1y',
            percentage: market.price_change_percentage_1y_in_currency,
        },
    ]

    const filteredRecords = records.filter((record) => typeof record.percentage === 'number') as Required<Record>[]

    return (
        <TableContainer className={classes.container}>
            <Table className={classes.table} size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {filteredRecords.map((x) =>
                            x.percentage ? (
                                <TableCell className={classes.cell} key={x.name}>
                                    {x.name}
                                </TableCell>
                            ) : null,
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        {filteredRecords.map((x) =>
                            x.percentage ? (
                                <TableCell className={classes.cell} key={x.name}>
                                    <PriceChanged amount={x.percentage} />
                                </TableCell>
                            ) : null,
                        )}
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
