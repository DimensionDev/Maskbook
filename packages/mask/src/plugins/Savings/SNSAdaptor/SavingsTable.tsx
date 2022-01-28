import { useAsync } from 'react-use'
import { Box, Grid, Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { FormattedBalance } from '@masknet/shared'
import { useWeb3, useAccount, formatBalance } from '@masknet/web3-shared-evm'
import { isZero, rightShift } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { IconURLs } from './IconURL'
import { useI18N } from '../../../utils'
import { ProtocolType, SavingsProtocol, TabType } from '../types'
import { SavingsProtocols } from '../protocols'

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
        borderRadius: '8px',
    },
    tableItem: {
        display: 'flex',
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
        borderRadius: '8px',
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
        bottom: '3px',
        right: '-5px',
    },
    protocolLabel: {
        fontSize: 12,
        opacity: 0.5,
    },
}))

export interface MappableProtocol {
    category: string
    protocols: SavingsProtocol[]
}

export interface SavingsTableProps {
    chainId: ChainId
    tab: TabType
    mappableProtocols: MappableProtocol[]
    setSelectedProtocol(protocol: ProtocolType): void
    setTab(tab: TabType): void
}

export function SavingsTable({ chainId, tab, mappableProtocols, setSelectedProtocol, setTab }: SavingsTableProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const web3 = useWeb3({ chainId })
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

            {mappableProtocols.map((categorizedProtocol) => {
                const protocols = categorizedProtocol.protocols
                if (protocols.length === 1) {
                    const protocol = protocols[0]

                    return (
                        <Grid container spacing={0} className={classes.tableRow} key={protocol.type}>
                            <Grid item xs={4} className={classes.tableCell}>
                                <div className={classes.logoWrap}>
                                    <img src={IconURLs[protocol.category]} className={classes.logo} />
                                    <img src={IconURLs[protocol.image]} className={classes.logoMini} />
                                </div>
                                <div>
                                    <Typography variant="body1">{protocol.category.toUpperCase()}</Typography>
                                    <Typography variant="body1" className={classes.protocolLabel}>
                                        {protocol.name}
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
                                        decimals={protocol.decimals}
                                        significant={6}
                                        minimumBalance={rightShift(10, protocol.decimals - 6)}
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
                                        setSelectedProtocol(protocol.type)
                                        setTab(tab)
                                    }}>
                                    {tab === TabType.Deposit
                                        ? t('plugin_savings_deposit')
                                        : t('plugin_savings_withdraw')}
                                </Button>
                            </Grid>
                        </Grid>
                    )
                } else {
                    /*
                     *
                     * @TODO: Add mappable protocols with chevron to toggle
                     * currency pairs to expand and collapse as according to Figma
                     *
                     * Reference:
                     * https://www.figma.com/file/gVkQ67y285b4FXVV1KPThN/TwitterV1?node-id=17600%3A374185
                     *
                     */
                    return <></>
                }
            })}
        </Box>
    )
}
