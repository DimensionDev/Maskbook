import { Skeleton, Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from '@mui/material'
import { range } from 'lodash-unified'

export function LoadingTable() {
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>
                        <Skeleton animation="wave" variant="rectangular" width="100%" height={22} />
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {range(5).map((i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <Skeleton animation="wave" variant="rectangular" width="100%" height={14} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell>
                        <Skeleton animation="wave" variant="rectangular" width="100%" height={28} />
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    )
}
