import { useAsync } from 'react-use'
import { Box, Grid, Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useWeb3, useAccount } from '@masknet/web3-shared-evm'
import type { ChainId } from '@masknet/web3-shared-evm'
import { IconURLS } from './IconURL'
import { useI18N } from '../../../utils'
import { ProtocolCategory, ProtocolType, TabType } from '../types'
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

export interface SavingsTableProps {
    chainId: ChainId
    tab: TabType
    setSelectedProtocol(protocol: ProtocolType): void
}

export function SavingsTable({ chainId, tab, setSelectedProtocol }: SavingsTableProps) {
    const { t } = useI18N()
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

    const CategorizedProtocols = Object.keys(ProtocolCategory).map((category) => {
        return {
            category,
            protocols: SavingsProtocols.filter(
                (protocol) => protocol.category.toLowerCase() === category.toLowerCase(),
            ),
        }
    })

    return (
        <Box className={classes.containerWrap}>
            <Grid container spacing={0} className={classes.tableHeader}>
                <Grid item xs={4} className={classes.tableCell}>
                    <Typography variant="body1">{t('plugin_savings_type')}</Typography>
                </Grid>
                <Grid item xs={2} className={classes.tableCell}>
                    <Typography variant="body1"> {t('plugin_savings_apy')}</Typography>
                </Grid>
                <Grid item xs={3} className={classes.tableCell}>
                    <Typography variant="body1">{t('plugin_savings_wallet')}</Typography>
                </Grid>
                <Grid item xs={3} className={classes.tableCell}>
                    <Typography variant="body1">{t('plugin_savings_operation')}</Typography>
                </Grid>
            </Grid>

            {CategorizedProtocols.filter((categorizedProtocol) => {
                if (categorizedProtocol.protocols.length === 0) {
                    return false
                }

                for (const protocol of categorizedProtocol.protocols) {
                    for (const network of protocol.availableNetworks) {
                        if (network.chainId === chainId) {
                            return true
                        }
                    }
                }

                return false
            }).map((categorizedProtocol) => {
                const protocols = categorizedProtocol.protocols
                if (protocols.length === 1) {
                    const protocol = protocols[0]

                    return (
                        <Grid container spacing={0} className={classes.tableHeader} key={protocol.type}>
                            <Grid item xs={4} className={classes.tableCell}>
                                <div className={classes.logoWrap}>
                                    <img src={IconURLS[protocol.category]} className={classes.logo} />
                                    <img src={IconURLS[protocol.image]} className={classes.logoMini} />
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
                                    {protocol.balance} {protocol.pair}
                                </Typography>
                            </Grid>
                            <Grid item xs={3} className={classes.tableCell}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setSelectedProtocol(protocol.type)}>
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
