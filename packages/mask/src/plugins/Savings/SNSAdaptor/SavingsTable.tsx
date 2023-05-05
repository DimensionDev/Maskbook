import { useAsync } from 'react-use'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Grid, Typography, useTheme } from '@mui/material'
import { FormattedBalance, TokenIcon } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { formatBalance, isZero, rightShift } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { Web3 } from '@masknet/web3-shared-evm'
import { ProviderIconURLs } from './IconURL.js'
import { useI18N } from '../../../utils/index.js'
import { ProtocolType, type SavingsProtocol, TabType } from '../types.js'
import { useChainContext, useWeb3, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { CrossIsolationMessages, NetworkPluginID } from '@masknet/shared-base'
import { useCallback, useMemo } from 'react'
import { LDO_PAIRS } from '../constants.js'

const useStyles = makeStyles()((theme, props) => ({
    containerWrap: {
        fontFamily: theme.typography.fontFamily,
    },
    tableContainer: {},
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
        color: theme.palette.text.primary,
        lineHeight: '18px',
        marginTop: 12,
    },
    animated: {
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
    empty: {
        color: theme.palette.secondaryDivider,
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
    const theme = useTheme()

    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    // Only fetch protocol APR and Balance on chainId change
    const { loading } = useAsync(async () => {
        await Promise.all(
            protocols.map(async (protocol) => {
                await protocol.updateApr(chainId, web3 as Web3)
                await protocol.updateBalance(chainId, web3 as Web3, account)
            }),
        )
    }, [chainId, web3, account, protocols])

    const onConvertClick = useCallback(() => {
        const ETH = LDO_PAIRS[0][0]
        const sETH = LDO_PAIRS[0][1]
        CrossIsolationMessages.events.swapDialogEvent.sendToLocal({
            open: true,
            traderProps: {
                defaultInputCoin: sETH,
                defaultOutputCoin: ETH,
                chainId: ChainId.Mainnet,
            },
        })
    }, [LDO_PAIRS])

    const renderProtocols = useMemo(() => {
        if (tab === TabType.Deposit) return protocols
        return protocols.filter((x) => !x.balance.isZero())
    }, [tab, protocols])

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

            {loading ? (
                <div className={classes.placeholder}>
                    <Icons.CircleLoading size={36} className={classes.animated} />
                    <Typography className={classes.loading}>{t('popups_loading')}</Typography>
                </div>
            ) : renderProtocols.length ? (
                <div className={classes.tableContainer}>
                    {renderProtocols.map((protocol, index) => (
                        <Grid container spacing={0} className={classes.tableRow} key={index}>
                            <Grid item xs={4} className={classes.tableCell}>
                                <div className={classes.logoWrap}>
                                    <TokenIcon
                                        name={protocol.bareToken.name}
                                        address={protocol.bareToken.address}
                                        className={classes.logo}
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
                            <Grid item xs={tab === TabType.Deposit ? 3 : 5} className={classes.tableCell}>
                                <FungibleTokenBalance tab={tab} protocol={protocol} />
                            </Grid>
                            <Grid item xs={3} className={classes.tableCell}>
                                <Button
                                    color="primary"
                                    disabled={tab === TabType.Withdraw ? isZero(protocol.balance) : false}
                                    onClick={() => {
                                        if (tab === TabType.Withdraw && protocol.type === ProtocolType.Lido) {
                                            onConvertClick()
                                            return
                                        }
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
                    <Icons.EmptySimple size={36} className={classes.empty} />
                    <Typography fontSize="14px" mt={1.5} color={theme.palette.maskColor.second}>
                        {t('plugin_savings_no_protocol')}
                    </Typography>
                </div>
            )}
        </Box>
    )
}

function FungibleTokenBalance({ protocol, tab }: { protocol: SavingsProtocol; tab: TabType }) {
    const { value: tokenBalance = '0' } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        tab === TabType.Deposit ? protocol.bareToken.address : '',
    )

    return (
        <Typography variant="body1">
            <FormattedBalance
                value={tab === TabType.Deposit ? tokenBalance : protocol.balance}
                decimals={protocol.bareToken.decimals}
                significant={6}
                minimumBalance={rightShift(10, protocol.bareToken.decimals - 6)}
                formatter={formatBalance}
            />
        </Typography>
    )
}
