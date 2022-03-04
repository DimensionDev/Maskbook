import { useAsync } from 'react-use'
import { Box, Grid, Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { FormattedBalance } from '@masknet/shared'
import { useWeb3, useAccount, formatBalance } from '@masknet/web3-shared-evm'
import { isZero, rightShift } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { SavingsProtocol, TabType } from '../types'

const useStyles = makeStyles()((theme, props) => ({
    containerWrap: {
        fontFamily: theme.typography.fontFamily,
    },
    tableHeader: {
        display: 'flex',
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
        borderRadius: '8px',
        margin: '0 0 15px 0',
    },
    tableRow: {
        display: 'flex',
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
        borderRadius: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginBottom: '0',
        },
    },
    tableItem: {
        display: 'flex',
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
        borderRadius: theme.spacing(1),
    },
    tableCell: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        fontSize: '14px',
    },
    logoWrap: {
        position: 'relative',
        margin: '0 20px 0 0',
    },
    logo: {
        height: '32px',
    },
    logoMini: {
        height: '16px',
        position: 'absolute',
        bottom: 0,
        right: '-5px',
    },
    protocolLabel: {},
}))

export interface SavingsTableProps {
    chainId: ChainId
    tab: TabType
    protocols: SavingsProtocol[]
    setTab(tab: TabType): void
    setSelectedProtocol(protocol: SavingsProtocol): void
}

export function SavingsTable({ chainId, tab, protocols, setTab, setSelectedProtocol }: SavingsTableProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const web3 = useWeb3({ chainId })
    const account = useAccount()

    // Only fetch protocol APR and Balance on chainId change
    useAsync(async () => {
        for (const protocol of protocols) {
            await protocol.updateApr(chainId, web3)
            await protocol.updateBalance(chainId, web3, account)
        }
    }, [chainId, web3, account, protocols])

    return (
        <Box className={classes.containerWrap}>
            <Grid container spacing={0} className={classes.tableHeader}>
                <Grid item xs={4} className={classes.tableCell}>
                    <Typography variant="body1">{t('plugin_savings_type')}</Typography>
                </Grid>
                <Grid item xs={2} className={classes.tableCell}>
                    <Typography variant="body1"> {t('plugin_savings_apr')}</Typography>
                </Grid>
                <Grid item xs={3} className={classes.tableCell}>
                    <Typography variant="body1">{t('plugin_savings_wallet')}</Typography>
                </Grid>
                <Grid item xs={3} className={classes.tableCell}>
                    <Typography variant="body1">{t('plugin_savings_operation')}</Typography>
                </Grid>
            </Grid>

            {protocols.map((protocol) => (
                <Grid container spacing={0} className={classes.tableRow} key={protocol.type}>
                    <Grid item xs={4} className={classes.tableCell}>
                        <div className={classes.logoWrap}>
                            <TokenIcon
                                name={protocol.bareToken.name}
                                address={protocol.bareToken.address}
                                classes={{ icon: classes.logo }}
                            />
                            <img src={ProviderIconURLs[protocol.type]} className={classes.logoMini} />
                        </div>
                        <div>
                            <Typography variant="body1" className={classes.protocolLabel}>
                                {protocol.bareToken.name}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={2} className={classes.tableCell}>
                        <Typography variant="body1">{protocol.apr}%</Typography>
                    </Grid>
                    <Grid item xs={3} className={classes.tableCell}>
                        <Typography variant="body1">
                            <FormattedBalance
                                value={protocol.balance}
                                decimals={protocol.bareToken.decimals}
                                significant={6}
                                minimumBalance={rightShift(10, protocol.bareToken.decimals - 6)}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={3} className={classes.tableCell}>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={tab === TabType.Withdraw ? isZero(protocol.balance) : false}
                            onClick={() => {
                                setTab(tab)
                                setSelectedProtocol(protocol)
                            }}>
                            {tab === TabType.Deposit ? t('plugin_savings_deposit') : t('plugin_savings_withdraw')}
                        </Button>
                    </Grid>
                </Grid>
            ))}
        </Box>
    )
}
