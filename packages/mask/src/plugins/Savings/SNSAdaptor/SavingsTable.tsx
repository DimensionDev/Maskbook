import { useAsync } from 'react-use'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Grid, Typography } from '@mui/material'
import { FormattedBalance, TokenIcon } from '@masknet/shared'
import { isZero, rightShift } from '@masknet/web3-shared-base'
import { ChainId, formatBalance, isSameAddress, useAccount, useAssets, useWeb3 } from '@masknet/web3-shared-evm'
import { ProviderIconURLs } from './IconURL'
import { useI18N } from '../../../utils'
import { SavingsProtocol, TabType } from '../types'
import { CircleLoadingIcon, DirectIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme, props) => ({
    containerWrap: {
        fontFamily: theme.typography.fontFamily,
    },
    tableContainer: {
        maxHeight: 350,
        overflowY: 'scroll',
    },
    tableHeader: {
        display: 'flex',
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
        borderRadius: theme.spacing(1),
        margin: '0 0 15px 0',
    },
    tableRow: {
        display: 'flex',
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
        borderRadius: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginBottom: 0,
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
        width: '32px',
        height: '32px',
    },
    logoMini: {
        height: '16px',
        position: 'absolute',
        bottom: 0,
        right: '-5px',
    },
    protocolLabel: {},
    placeholder: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
        width: '100%',
    },
    loading: {
        fontSize: 14,
        color: theme.palette.text.primary,
        lineHeight: '18px',
        marginTop: 12,
    },
    animated: {
        fontSize: 36,
        '@keyframes loadingAnimation': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(360deg)',
            },
        },
        animation: 'loadingAnimation 1s linear infinite',
    },
    direct: {
        fill: theme.palette.secondaryDivider,
        fontSize: 36,
    },
    unavailable: {
        fontSize: 14,
        color: theme.palette.secondaryDivider,
        marginTop: 12,
    },
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

    const { value: assets, loading: getAssetsLoading } = useAssets(
        protocols.map((x) => x.bareToken),
        chainId,
    )

    // Only fetch protocol APR and Balance on chainId change
    const { loading } = useAsync(async () => {
        await Promise.all(
            protocols.map(async (protocol) => {
                protocol.updateApr(chainId, web3)
                protocol.updateBalance(chainId, web3, account)
            }),
        )
    }, [chainId, web3, account, protocols])

    return (
        <Box className={classes.containerWrap}>
            <Grid container spacing={0} className={classes.tableHeader}>
                <Grid item xs={4} className={classes.tableCell}>
                    <Typography variant="body1">{t('plugin_savings_asset')}</Typography>
                </Grid>
                {tab === TabType.Deposit ? (
                    <Grid item xs={2} className={classes.tableCell}>
                        <Typography variant="body1"> {t('plugin_savings_apr')}</Typography>
                    </Grid>
                ) : null}
                <Grid item xs={tab === TabType.Deposit ? 3 : 5} className={classes.tableCell}>
                    <Typography variant="body1">{t('plugin_savings_wallet')}</Typography>
                </Grid>
                <Grid item xs={3} className={classes.tableCell}>
                    <Typography variant="body1">{t('plugin_savings_operation')}</Typography>
                </Grid>
            </Grid>

            {loading || getAssetsLoading ? (
                <div className={classes.placeholder}>
                    <CircleLoadingIcon className={classes.animated} />
                    <Typography className={classes.loading}>{t('popups_loading')}</Typography>
                </div>
            ) : protocols.length ? (
                <div className={classes.tableContainer}>
                    {protocols
                        .filter((x) => !x.balance.isZero())
                        .map((protocol, index) => (
                            <Grid container spacing={0} className={classes.tableRow} key={index}>
                                <Grid item xs={4} className={classes.tableCell}>
                                    <div className={classes.logoWrap}>
                                        <TokenIcon
                                            name={protocol.bareToken.name}
                                            address={protocol.bareToken.address}
                                            classes={{ icon: classes.logo }}
                                            chainId={chainId}
                                        />
                                        <img src={ProviderIconURLs[protocol.type]} className={classes.logoMini} />
                                    </div>
                                    <div>
                                        <Typography variant="body1" className={classes.protocolLabel}>
                                            {protocol.bareToken.symbol}
                                        </Typography>
                                    </div>
                                </Grid>
                                {tab === TabType.Deposit ? (
                                    <Grid item xs={2} className={classes.tableCell}>
                                        <Typography variant="body1">{protocol.apr}%</Typography>
                                    </Grid>
                                ) : null}
                                <Grid xs={tab === TabType.Deposit ? 3 : 5} className={classes.tableCell}>
                                    <Typography variant="body1">
                                        <FormattedBalance
                                            value={
                                                tab === TabType.Deposit
                                                    ? assets.find((x) =>
                                                          isSameAddress(x.token.address, protocol.bareToken.address),
                                                      )?.balance
                                                    : protocol.balance
                                            }
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
                                        {tab === TabType.Deposit
                                            ? t('plugin_savings_deposit')
                                            : t('plugin_savings_withdraw')}
                                    </Button>
                                </Grid>
                            </Grid>
                        ))}
                </div>
            ) : (
                <div className={classes.placeholder}>
                    <DirectIcon className={classes.direct} />
                    <Typography className={classes.unavailable}>{t('plugin_no_protocol_available')}</Typography>
                </div>
            )}
        </Box>
    )
}
