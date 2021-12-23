import { useRemoteControlledDialog } from '@masknet/shared'
import { Button, DialogContent, IconButton } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import CloseIcon from '@mui/icons-material/Close'
import { useState, useCallback } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useChainId, useAccount, useWallet, useWeb3Provider } from '@masknet/web3-shared-evm'
import { PluginYearnFinanceMessages } from '../messages'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { DepositDialog } from './DepositDialog'
import { WithdrawDialog } from './WithdrawDialog'
import { useYearnVaults } from '../hooks/useYearnVaults'
import { formatUnits } from '@ethersproject/units'
import type { Vault } from '@yfi/sdk'

const useStyles = makeStyles()((theme) => ({
    dialogPaper: {
        width: '640px !important',
    },
    dialogContent: {
        padding: '0 !important',
    },
    close: {
        color: `${theme.palette.common.white} !important`,
        backgroundColor: `${theme.palette.primary.light} !important`,
        top: theme.spacing(2),
        right: theme.spacing(2),
        position: 'absolute',
    },
    content: {
        width: '100%',
        padding: 0,
        backgroundColor: theme.palette.common.white,
        position: 'relative',
    },
    frame: {
        display: 'block',
        width: '100%',
        height: 430,
        border: 0,
    },

    wrapper: {
        paddingBottom: '0px !important',
        paddingTop: '0px !important',
    },
    actionButton: {
        margin: '0 auto',
        minHeight: 'auto',
        width: '100%',
        fontSize: 18,
        fontWeight: 400,
    },
    footer: {
        marginTop: theme.spacing(2),
        zIndex: 1,
    },
    footnote: {
        fontSize: 10,
        marginRight: theme.spacing(1),
    },
    footLink: {
        cursor: 'pointer',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
    },
    tokenCardWrapper: {
        width: '100%',
        color: 'white',
        overflow: 'auto',
        paddingTop: theme.spacing(1),
        marginBottom: theme.spacing(0.5),
    },
    tokenCard: {
        width: 535,
        marginLeft: 'auto',
        marginRight: 'auto',
        color: 'white',
        flexDirection: 'column',
        padding: 0,
        marginBottom: theme.spacing(1.5),
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    cardHeader: {
        display: 'flex',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        height: 42,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        '-webkit-font-smoothing': 'antialiased',
        fontSize: 14,
    },
    cardHeaderLocked: {
        background: theme.palette.mode === 'light' ? '#EBEEF0' : '#2F3336',
        color: theme.palette.mode === 'light' ? '#7B8192' : '#6F767C',
    },
    cardHeaderClaimable: {
        background: '#77E0B5',
        color: 'white',
    },
    cardContent: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        height: 62,
        fontSize: 18,
    },
    cardContentLocked: {
        background: theme.palette.mode === 'light' ? 'white' : '',
        border: `1px solid ${theme.palette.mode === 'light' ? '#EBEEF0' : '#2F3336'}`,
    },
    cardContentClaimable: {
        background: theme.palette.mode === 'light' ? 'rgba(119, 224, 181, 0.15)' : 'rgba(56, 221, 192, 0.2)',
        border: '1px solid rgba(56, 221, 192, 0.2)',
    },
    // content: {
    //     marginBottom: theme.spacing(2),
    // },
    contentTitle: {
        fontSize: 18,
        fontWeight: 300,
    },
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
    },
    tabs: {
        width: 536,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
        backgroundColor: theme.palette.background.default,
        '& .Mui-selected': {
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
        },
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'column',
        height: 450,
    },
    actionButtonWrapper: {
        position: 'sticky',
        width: '100%',
        marginTop: 'auto',
        bottom: 0,
        zIndex: 2,
        paddingBottom: theme.spacing(4),
        paddingTop: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
    },
    emptyContentWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 350,
    },

    lockIcon: {
        width: 22,
        height: 22,
        marginRight: 6,
    },
    textWrapper: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: theme.spacing(1.5),
    },
    unlockTime: {
        marginRight: theme.spacing(1.5),
    },
    tokenBalance: {
        marginLeft: theme.spacing(1.5),
        color: theme.palette.mode === 'light' ? '#15181B' : '#D9D9D9',
    },
    tokenSymbol: {
        color: theme.palette.mode === 'light' ? '#7B8192' : '#6F767C',
    },
    snackbarSuccess: {
        backgroundColor: '#77E0B5',
    },
    snackbarError: {
        backgroundColor: '#FF5555',
    },
    abstractTabWrapper: {
        position: 'sticky',
        top: 0,
        width: '100%',
        minHeight: 120,
        zIndex: 2,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
    },
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },
    table: {
        height: 250,
    },
    tableContent: {
        height: 250,
    },
    vaultDisplayIcon: {
        width: '25px',
        height: 'auto',
    },
}))

export interface VaultListDialogProps extends withClasses<never | 'root'> {}

export function VaultListDialog(props: VaultListDialogProps) {
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const currentChainId = useChainId()

    const [chainId, setChainId] = useState(currentChainId)

    const wProvider = useWeb3Provider()

    const {
        value: vaults,
        error: errorVaults,
        loading: loadingVaults,
        retry: retryVaults,
    } = useYearnVaults(wProvider, currentChainId)

    const lendingPoolAddress = ''

    //#region remote controlled buy token dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginYearnFinanceMessages.vaultListDialogUpdated)
    //#endregion

    const wallet = useWallet()

    const [currentAPY, setCurrentAPY] = useState()

    const [currentVault, setCurrentVault] = useState<Vault>()
    //const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

    const {
        open: openDepositDialog,
        openDialog: onOpenDepositDialog,
        closeDialog: onCloseDepositDialog,
    } = useRemoteControlledDialog(PluginYearnFinanceMessages.depositTokenDialog)

    const handleDeposit = useCallback((vault: Vault) => {
        setCurrentVault(vault)
        onOpenDepositDialog()
    }, [])

    const onDepositDialogConfirm = useCallback(async () => {}, [])

    const {
        open: openWithdrawDialog,
        openDialog: onOpenWithdrawDialog,
        closeDialog: onCloseWithdrawDialog,
    } = useRemoteControlledDialog(PluginYearnFinanceMessages.withdrawTokenDialog)

    const handleWithdraw = useCallback((vault: Vault) => {
        setCurrentVault(vault)
        onOpenWithdrawDialog()
    }, [])

    const onWithdrawDialogConfirm = useCallback(async () => {}, [])

    return (
        <div>
            <InjectedDialog
                open={open}
                onClose={closeDialog}
                classes={{
                    paper: classes.dialogPaper,
                    dialogContent: classes.dialogContent,
                }}
                disableBackdropClick>
                <DialogContent className={classes.content}>
                    <IconButton className={classes.close} size="small" onClick={closeDialog}>
                        <CloseIcon />
                    </IconButton>
                    <div className={classes.walletStatusBox}>
                        <WalletStatusBox />
                    </div>
                    {/* <div className={classes.abstractTabWrapper}>						
                        <NetworkTab
                            chainId={chainId}
                            setChainId={setChainId}
                            classes={classes}
                            chains={[ChainId.Mainnet, ChainId.Kovan]}
                        />
                    </div> */}

                    {errorVaults && <h3>Error Loading Vaults</h3>}

                    {loadingVaults && <h3>Loading All Vaults</h3>}

                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 450 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Vault</TableCell>
                                    {/* <TableCell align="right">Total Assets</TableCell> */}
                                    {/* <TableCell align="right">Total Supply</TableCell> */}
                                    <TableCell align="right">Total Assets (USDC)</TableCell>
                                    <TableCell align="right">Net Apy (%)</TableCell>
                                    {/* <TableCell align="right">Deposit Limit</TableCell> */}

                                    <TableCell align="right">Action &nbsp;</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {vaults?.map((vault) => (
                                    <TableRow
                                        key={vault.address}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            <img
                                                className={classes.vaultDisplayIcon}
                                                src={vault.metadata.displayIcon}
                                            />
                                            {vault.name} {/*({vault.symbol}) */}
                                        </TableCell>
                                        {/* <TableCell align="right">{parseFloat(vault.metadata.totalAssets ?? '0').toLocaleString(undefined, {maximumFractionDigits:2})} </TableCell> */}
                                        {/* <TableCell align="right">
                                            {vault.metadata.totalSupply ?? '0'}
                                        </TableCell> */}
                                        <TableCell align="right">
                                            ${' '}
                                            {Number.parseFloat(
                                                formatUnits(vault.underlyingTokenBalance.amountUsdc, 6),
                                            ).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                                        </TableCell>
                                        <TableCell align="right">
                                            {(100 * (vault?.metadata.apy?.net_apy ?? 0)).toFixed(2)} %
                                        </TableCell>
                                        {/* <TableCell align="right">
                                            
                                            { parseFloat(formatUnits(vault.metadata.depositLimit, vault.decimals))} 
                                        </TableCell> */}

                                        <TableCell align="right">
                                            <Button variant="contained" onClick={() => handleDeposit(vault)}>
                                                Deposit
                                            </Button>

                                            <Button variant="contained" onClick={() => handleWithdraw(vault)}>
                                                Withdraw
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </InjectedDialog>

            {currentVault && (
                <DepositDialog
                    wallet={wallet}
                    open={openDepositDialog}
                    vault={currentVault}
                    onConfirm={onDepositDialogConfirm}
                    onClose={onCloseDepositDialog}
                />
            )}

            {currentVault && (
                <WithdrawDialog
                    vault={currentVault}
                    wallet={wallet}
                    open={openWithdrawDialog}
                    onClose={onCloseWithdrawDialog}
                    onConfirm={onWithdrawDialogConfirm}
                />
            )}
        </div>
    )
}
