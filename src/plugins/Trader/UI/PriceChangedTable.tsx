import React from 'react'
import {
    TableContainer,
    Table,
    makeStyles,
    Theme,
    createStyles,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
} from '@material-ui/core'
import type { Market } from '../type'
import { PriceChanged } from './PriceChanged'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {},
        table: {},
        cell: {
            paddingLeft: theme.spacing(1.5),
            paddingRight: theme.spacing(1),
            whiteSpace: 'nowrap',
        },
    }),
)

export interface PriceChangedTableProps {
    market: Market
}

export function PriceChangedTable({ market }: PriceChangedTableProps) {
    const classes = useStyles()
    const records: {
        name: string
        percentage?: number
    }[] = [
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

    return (
        <TableContainer className={classes.container}>
            <Table className={classes.table} size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {records.map((x) =>
                            typeof x.percentage === 'number' ? (
                                <TableCell className={classes.cell} key={x.name}>
                                    {x.name}
                                </TableCell>
                            ) : null,
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        {records.map((x) =>
                            typeof x.percentage === 'number' ? (
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
