import { Skeleton, Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from '@mui/material'

export const loadingTable = (
    <Table size="small">
        <TableHead>
            <TableRow>
                <TableCell>
                    <Skeleton animation="wave" variant="rectangular" width="100%" height={22} />
                </TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {Array.from({ length: 5 })
                .fill(0)
                .map((_, i) => (
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
