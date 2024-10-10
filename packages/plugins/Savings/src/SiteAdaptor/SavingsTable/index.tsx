import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Grid, Typography, useTheme } from '@mui/material'
import { useCallback } from 'react'
import { TabType, type SavingsProtocol } from '../../types.js'
import { SavingsRow } from './SavingsRow.js'
import { LidoProtocol } from '../../protocols/LDOProtocol.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme, props) => ({
    containerWrap: {
        fontFamily: theme.typography.fontFamily,
    },
    tableContainer: {},
    tableHeader: {
        display: 'flex',
        background: theme.palette.maskColor.bg,
        borderRadius: theme.spacing(1),
        margin: '0 0 15px 0',
    },
    tableCell: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        fontSize: '14px',
    },
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

interface SavingsTableProps {
    tab: TabType
    loadingProtocols: boolean
    protocols: SavingsProtocol[]
    onWithdraw?: (protocol: SavingsProtocol) => void
    onDeposit?: (protocol: SavingsProtocol) => void
}

export function SavingsTable({ tab, protocols, loadingProtocols, onWithdraw, onDeposit }: SavingsTableProps) {
    const { classes } = useStyles()
    const theme = useTheme()

    const handleWithdraw = useCallback((protocol: SavingsProtocol) => {
        if (protocol instanceof LidoProtocol) {
            onWithdraw?.(protocol)
        }
    }, [])

    const isDeposit = tab === TabType.Deposit

    return (
        <Box className={classes.containerWrap}>
            <Grid container spacing={0} className={classes.tableHeader}>
                <Grid item xs={4} className={classes.tableCell}>
                    <Typography variant="body1">
                        <Trans>Asset</Trans>
                    </Typography>
                </Grid>
                {isDeposit ?
                    <Grid item xs={2} className={classes.tableCell}>
                        <Typography variant="body1">
                            <Trans>APR</Trans>
                        </Typography>
                    </Grid>
                :   null}
                <Grid item xs={isDeposit ? 3 : 5} className={classes.tableCell}>
                    <Typography variant="body1">
                        <Trans>Wallet</Trans>
                    </Typography>
                </Grid>
                <Grid item xs={3} className={classes.tableCell}>
                    <Typography variant="body1">
                        <Trans>Operation</Trans>
                    </Typography>
                </Grid>
            </Grid>

            {loadingProtocols ?
                <div className={classes.placeholder}>
                    <Icons.CircleLoading size={36} className={classes.animated} />
                    <Typography className={classes.loading}>
                        <Trans>Loading</Trans>
                    </Typography>
                </div>
            : protocols.length ?
                <div className={classes.tableContainer}>
                    {protocols.map((protocol, index) => (
                        <SavingsRow
                            key={index}
                            protocol={protocol}
                            isDeposit={isDeposit}
                            onWithdraw={handleWithdraw}
                            onDeposit={onDeposit}
                        />
                    ))}
                </div>
            :   <div className={classes.placeholder}>
                    <Icons.EmptySimple size={36} className={classes.empty} />
                    <Typography fontSize="14px" mt={1.5} color={theme.palette.maskColor.second}>
                        <Trans>No deposit protocols found.</Trans>
                    </Typography>
                </div>
            }
        </Box>
    )
}
