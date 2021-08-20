import { memo } from 'react'
import { Table, TableCell, TableHead, TableRow, Typography, TableBody, Button, Skeleton } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { FormattedAddress, FormattedBalance } from '@masknet/shared'

const useStyles = makeStyles()({
    header: {
        backgroundColor: '#F7F9FA',
        padding: '14px 0',
        borderBottom: 'none',
    },
    title: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
    },
    cell: {
        padding: '8px 0',
        borderBottom: 'none',
    },
    button: {
        minWidth: 0,
        padding: '0 5px',
    },
})

export interface DeriveWalletTableProps {
    loading: boolean
    dataSource?: { address: string; added: boolean; balance: string }[]
    onAdd: (index: number) => void
}

export const DeriveWalletTable = memo<DeriveWalletTableProps>(({ loading, dataSource, onAdd }) => {
    const { classes } = useStyles()
    return (
        <Table size="small" padding="none">
            <TableHead>
                <TableRow>
                    <TableCell key="address" align="center" variant="head" className={classes.header}>
                        <Typography className={classes.title}>Address</Typography>
                    </TableCell>
                    <TableCell key="balance" align="center" variant="head" className={classes.header}>
                        <Typography className={classes.title}>Balance(ETH)</Typography>
                    </TableCell>
                    <TableCell key="Operation" align="center" variant="head" className={classes.header}>
                        <Typography className={classes.title}>Operation</Typography>
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {dataSource?.length && !loading
                    ? dataSource.map((item, index) => (
                          <TableRow key={item.address}>
                              <TableCell align="center" variant="body" className={classes.cell}>
                                  <Typography className={classes.title}>
                                      <FormattedAddress address={item.address} size={4} />
                                  </Typography>
                              </TableCell>
                              <TableCell align="center" variant="body" className={classes.cell}>
                                  <Typography className={classes.title}>
                                      <FormattedBalance
                                          value={item.balance}
                                          decimals={18}
                                          significant={4}
                                          symbol="ETH"
                                      />
                                  </Typography>
                              </TableCell>
                              <TableCell align="center" variant="body" className={classes.cell}>
                                  <Button disabled={item.added} className={classes.button} onClick={() => onAdd(index)}>
                                      {item.added ? 'added' : 'add'}
                                  </Button>
                              </TableCell>
                          </TableRow>
                      ))
                    : Array.from({ length: 10 })
                          .fill(0)
                          .map((_, index) => (
                              <TableRow key={index}>
                                  <TableCell align="center" variant="body" className={classes.cell}>
                                      <Skeleton animation="wave" variant="rectangular" width="90%" height={24} />
                                  </TableCell>
                                  <TableCell align="center" variant="body" className={classes.cell}>
                                      <Skeleton animation="wave" variant="rectangular" width="90%" height={24} />
                                  </TableCell>
                                  <TableCell align="center" variant="body" className={classes.cell}>
                                      <Skeleton animation="wave" variant="rectangular" width="90%" height={24} />
                                  </TableCell>
                              </TableRow>
                          ))}
            </TableBody>
        </Table>
    )
})
