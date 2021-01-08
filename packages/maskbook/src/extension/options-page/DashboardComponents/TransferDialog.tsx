import {
    Box,
    Button,
    createStyles,
    FormControl,
    FormControlLabel,
    Hidden,
    Input,
    InputAdornment,
    makeStyles,
    Paper,
    Switch,
    TextField,
    Typography,
} from '@material-ui/core'
import { useState } from 'react'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../DashboardDialogs/Base'
import AbstractTab, { AbstractTabProps } from './AbstractTab'
import ImportExportIcon from '@material-ui/icons/ImportExport'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { BigNumber } from 'bignumber.js'
import { formatBalance } from '../../../plugins/Wallet/formatter'


//#region wallet import dialog
interface WalletProps {
    wallet: WalletRecord
}

interface TransferPageprops {
    wallet: WalletRecord
    token: ERC20TokenDetailed | EtherTokenDetailed
    onClick: () => void
}

const useTransferPageStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            padding: theme.spacing(1),
        },
        line: {
            height: 60,
            padding: theme.spacing(1),
        },

        footer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.spacing(1),
        },

        box: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
        table: {
            display: 'none',
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            '& > * ': {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                border: '1px solid rgba(224, 224, 224, 1)',
                paddingTop: theme.spacing(1),
                paddingBottom: theme.spacing(1),
                alignItems: 'center',
            },
            '& > *:first-child': {
                borderBottomWidth: 0,
            },
            '& > *:last-chid': {
                borderTopWidth: 0,
            },
        },
        amount: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            '& > *:first-child': {
                display: 'flex',
                flex: 1,
                justifyContent: 'center',
                alignItem: 'center',
            },
            '& > *:last-child': {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItem: 'center',
            },
        },
        amount_label: {
            fontSize: 28,
            color: theme.palette.text.secondary,
        },
        amount_num: {
            fontSize: 36,
            color: theme.palette.text.primary,
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
        }
    }),
)
function TransferPage(props: TransferPageprops) {
    const classes = useTransferPageStyles()
    const { wallet, token, onClick } = props
    const { t } = useI18N()

    // balance
    const { value: tokenBalance = '0',  } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )
    //#endregion

    return (
        <Paper className={classes.paper}>

            <FormControl className={classes.amount}>
                <Box>
                    <Input  classes={{root: classes.amount_num}}  placeholder='0.0' disableUnderline={true} startAdornment={
                        <InputAdornment>
                            <Typography classes={{root: classes.amount_label}} variant="body2" color="textSecondary">
                                {token.symbol}
                            </Typography>
                    </InputAdornment>}></Input>
                </Box>
                <InputAdornment position="end">
                    <ImportExportIcon color='disabled' />
                    <Typography variant="body2" color="textSecondary">
                        {token.symbol}
                    </Typography>
                </InputAdornment>
            </FormControl>


            <Box className={classes.box}>
                <Typography align="center" variant="body2" color="textSecondary">

                </Typography>
            </Box>

            <Box className={classes.box}>
                <Typography align="left" variant="body2" color="textSecondary">
                    {t('wallet_transfer_to_address')}
                </Typography>
                <TextField />
            </Box>
            <Box className={classes.table}>
                <Box className={classes.line}>
                    <Typography align="left" variant="body2" color="textPrimary" component="span">
                        Transaction fee
                    </Typography>
                    <Typography align="right" variant="body2" color="textSecondary" component="span">
                        Cost 0.0000167 ETH=$0.78
                    </Typography>
                </Box>
                <Box className={classes.line}>
                    <Typography align="left" variant="body2" color="textPrimary" component="span">
                        Advanced
                    </Typography>
                    <FormControlLabel
                        value="start"
                        control={<Switch color="primary" />}
                        label="Date"
                        labelPlacement="start"
                    />
                </Box>
            </Box>

            <Box className={classes.box}>
                <TextField placeholder="Mome" />
            </Box>
            <Box className={classes.box}>
                <Button variant="outlined" color="primary" onClick={onClick}>
                    {t('wallet_transfer_send')}
                </Button>
            </Box>
            <footer className={classes.footer}>
                <Typography align="left" variant="body2" color="textPrimary">
                    {t("wallet_transfer_balance")}
                </Typography>
                <Typography align="right" variant="body2" color="textSecondary">
                    {formatBalance(new BigNumber(tokenBalance ?? '0'), token.decimals ?? 0)} {token.symbol}
                </Typography>
            </footer>
        </Paper>
    )
}

export function DashboardWalletTransferDialog(
    props: WrappedDialogProps<WalletProps & { token: ERC20TokenDetailed | EtherTokenDetailed }>,
) {
    const { wallet, token } = props.ComponentProps!

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Send',
                children: <TransferPage wallet={wallet} token={token} onClick={props.onClose} />,
                sx: { p: 0 },
            },
            {
                label: 'Share',
                children: <p>Share</p>,
                sx: { p: 0 },
            },
        ],
        state,
    }

    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper size="medium" primary="" content={<AbstractTab height={302} {...tabProps} />} />
        </DashboardDialogCore>
    )
}
