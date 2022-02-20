import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@masknet/theme'
import { Button, Grid, Typography } from '@mui/material'
import { useFetchUserTokens } from '../hooks/useFetchUserTokens'
import { useAccount } from '@masknet/web3-shared-evm'
import { LoadingAnimation } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SellButton } from '../SNSAdaptor/SellButton'
import { LockDialog } from '../SNSAdaptor/LockDialog'
import type { IdeaToken } from '../types'
import { useState } from 'react'

function createData(name: string, calories: number, fat: number, carbs: number, protein: number) {
    return { name, calories, fat, carbs, protein }
}

const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
]

const useStyles = makeStyles()((theme) => {
    return {
        empty: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: theme.spacing(8, 0),
        },
        message: {
            textAlign: 'center',
        },
    }
})

export function AccountView() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const account = useAccount()
    const { value, error, loading } = useFetchUserTokens(account)
    const [open, setOpenDialog] = useState(false)
    console.log(value, error)

    if (loading) {
        return (
            <div className={classes.empty}>
                <LoadingAnimation />
            </div>
        )
    }

    // if (value?.ideaTokenBalances.length === 0) {
    //     return (
    //         <Typography className={classes.empty} color="textPrimary">
    //             {t('no_data')}
    //         </Typography>
    //     )
    // }

    if (error) {
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_ideamarket_smthg_wrong')}
            </Typography>
        )
    }

    const onClose = () => setOpenDialog(false)

    return (
        <>
            <TableContainer component={Paper}>
                <Table sx={{ width: '100%' }} aria-label="simple table">
                    {/* <TableHead>
                        <TableRow>
                            <TableCell>Idea</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Test&nbsp;(g)</TableCell>
                            <TableCell align="right">Test&nbsp;(g)</TableCell>
                        </TableRow>
                    </TableHead> */}
                    <TableBody>
                        {value?.ideaTokenBalances.map((token: IdeaToken) => (
                            <TableRow key={token.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    {token.name}
                                </TableCell>
                                <TableCell align="right">{token.supply}</TableCell>
                                <TableCell align="right">{token.holders}</TableCell>
                                <TableCell align="right">
                                    <Button color="primary" size="small" variant="contained" aria-label="lock">
                                        Lock
                                    </Button>
                                    <SellButton tokenContractAddress={token.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow key="ok">
                            <TableCell align="left">
                                <Grid container direction="column">
                                    <Grid item>Name</Grid>
                                    <Grid item>Market</Grid>
                                </Grid>
                            </TableCell>
                            <TableCell align="right">
                                <Grid container direction="row" wrap="nowrap">
                                    <Grid container item direction="column">
                                        <Grid item>$1,046</Grid>
                                        <Grid item>1dchange</Grid>
                                    </Grid>
                                    <Grid container item direction="column">
                                        <Grid item>$1,046</Grid>
                                        <Grid item>Price</Grid>
                                    </Grid>
                                    <Grid container item direction="column">
                                        <Grid item>$1,046</Grid>
                                        <Grid item>Supply</Grid>
                                    </Grid>
                                    <Grid container item direction="column">
                                        <Grid item>$1,046</Grid>
                                        <Grid item>Deposits</Grid>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell align="right">
                                <Button
                                    onClick={() => setOpenDialog(true)}
                                    color="primary"
                                    size="small"
                                    variant="contained"
                                    aria-label="lock">
                                    Lock
                                </Button>
                                <SellButton tokenContractAddress="0x004883775235a0d1e0b6e101cce43a7b4481340b" />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <LockDialog open={open} onClose={onClose} />
        </>
    )
}
