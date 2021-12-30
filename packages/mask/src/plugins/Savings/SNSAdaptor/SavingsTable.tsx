import { useAsync } from 'react-use'
import { Box, Grid, Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useWeb3, useAccount } from '@masknet/web3-shared-evm'
import { IconURLS } from './IconURL'
import { TabType } from '../types'
import { SavingsProtocols } from '../protocols'

const useStyles = makeStyles()((theme, props) => ({
    containerWrap: {
        padding: '0 15px',
        fontFamily: theme.typography.fontFamily,
    },
    tableHeader: {
        display: 'flex',
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
        borderRadius: '8px',
        margin: '0 0 15px 0',
    },
    tableItem: {
        display: 'flex',
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
        borderRadius: '8px',
        margin: '0 0 15px 0',
    },
    tableCell: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        fontSize: '14px',
    },
    logo: {
        height: '32px',
        margin: '0 15px 0 0',
    },
}))

export interface SavingsTableProps {
    chainId: number
    tab: TabType
    setSelectedProtocol(protocol: number): void
}

export function SavingsTable({ chainId, tab, setSelectedProtocol }: SavingsTableProps) {
    const { classes } = useStyles()

    const web3 = useWeb3(false, chainId)
    const account = useAccount()

    // Only fetch protocol APR and Balance on chainId change
    useAsync(async () => {
        for (const protocol of SavingsProtocols) {
            await protocol.getApr()
            await protocol.getBalance(chainId, web3, account)
        }
    }, [chainId])

    return (
        <Box className={classes.containerWrap}>
            <Grid container spacing={0} className={classes.tableHeader}>
                <Grid item xs={4} className={classes.tableCell}>
                    Protocol
                </Grid>
                <Grid item xs={2} className={classes.tableCell}>
                    APY
                </Grid>
                <Grid item xs={3} className={classes.tableCell}>
                    Value
                </Grid>
                <Grid item xs={3} className={classes.tableCell}>
                    {tab === TabType.Deposit ? 'Deposit' : 'Withdraw'}
                </Grid>
            </Grid>

            {SavingsProtocols.filter((protocol) => {
                for (const network of protocol.availableNetworks) {
                    if (network.chainId === chainId) {
                        return true
                    }
                }
                return false
            }).map((protocol) => {
                return (
                    <Grid container spacing={0} className={classes.tableHeader} key={protocol.id}>
                        <Grid item xs={4} className={classes.tableCell}>
                            <img src={IconURLS[protocol.image]} className={classes.logo} />
                            {protocol.name}
                        </Grid>
                        <Grid item xs={2} className={classes.tableCell}>
                            {protocol.apr}%
                        </Grid>
                        <Grid item xs={3} className={classes.tableCell}>
                            {protocol.balance} {protocol.pair}
                        </Grid>
                        <Grid item xs={3} className={classes.tableCell}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setSelectedProtocol(protocol.id)}>
                                {tab === 'deposit' ? 'Deposit' : 'Withdraw'}
                            </Button>
                        </Grid>
                    </Grid>
                )
            })}
        </Box>
    )
}
