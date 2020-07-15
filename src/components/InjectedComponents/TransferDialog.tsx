import React, { useCallback, useState } from 'react'
import {
    makeStyles,
    IconButton,
    DialogTitle,
    Typography,
    Divider,
    Link,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    createStyles,
    Theme,
    TextField,
} from '@material-ui/core'
import { getActivatedUI } from '../../social-network/ui'
import {
    useTwitterButton,
    useTwitterCloseButton,
    useTwitterDialog,
} from '../../social-network-provider/twitter.com/utils/theme'
import { useStylesExtends } from '../custom-ui-helper'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { useSelectWallet } from '../../plugins/shared/useWallet'
import type { WalletDetails, ERC20TokenDetails } from '../../extension/background-script/PluginService'
import { EthereumTokenType } from '../../plugins/Wallet/database/types'
import BigNumber from 'bignumber.js'
import { formatBalance } from '../../plugins/Wallet/formatter'
import ShadowRootDialog from '../../utils/jss/ShadowRootDialog'
import { DialogDismissIconUI } from './DialogDismissIcon'
import { WalletSelect } from '../../plugins/shared/WalletSelect'
import { TokenSelect } from '../../plugins/shared/TokenSelect'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        form: { '& > *': { margin: theme.spacing(1, 0) } },
        title: {
            marginLeft: 6,
        },
        nativeInput: {
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0,
            },
            '-moz-appearance': 'textfield',
        },
    }),
)

export interface TransferPayload {
    amount: number
    address: string
    token: ERC20TokenDetails
    tokenType: EthereumTokenType
}

interface TransferDialogUIProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'root'
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'header'
        | 'content'
        | 'actions'
        | 'close'
        | 'button'
    > {
    loading: boolean
    nickname?: string
    address: string
    open: boolean
    onTransfer(opt: TransferPayload): Promise<void> | void
    onClose(): void
    wallets: WalletDetails[] | undefined
    tokens: ERC20TokenDetails[] | undefined
}

function TransferDialogUI(props: TransferDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const useSelectWalletResult = useSelectWallet(props.wallets, props.tokens)
    const { erc20Balance, ethBalance, selectedToken, selectedTokenType, selectedWallet } = useSelectWalletResult

    const [amount, setAmount] = useState(0.01)
    const [, amountInputRef] = useCapturedInput((x) => setAmount(parseFloat(x)))
    const amountMaxBigint = selectedWallet
        ? selectedTokenType === EthereumTokenType.ETH
            ? selectedWallet.eth_balance
            : selectedToken?.amount
        : undefined
    const amountMaxNumber = BigNumber.isBigNumber(amountMaxBigint)
        ? selectedTokenType === EthereumTokenType.ETH
            ? formatBalance(amountMaxBigint, 18)
            : selectedToken && formatBalance(amountMaxBigint, selectedToken.decimals)
        : undefined

    const isDisabled = [
        Number.isNaN(amount),
        amount <= 0,
        selectedWallet === undefined,
        amount > (amountMaxNumber || 0),
    ]
    const isButtonDisabled = isDisabled.some((x) => x)

    if (!props.address) return null
    return (
        <div className={classes.root}>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={props.open}
                scroll="body"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                onEscapeKeyDown={props.onClose}
                onExit={props.onClose}
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={props.onClose}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="inherit">
                        Send
                    </Typography>
                </DialogTitle>
                <Divider />
                <DialogContent className={classes.content}>
                    <form className={classes.form}>
                        <TextField
                            inputProps={{
                                className: classes.nativeInput,
                            }}
                            variant="filled"
                            fullWidth
                            defaultValue={props.nickname ? `(${props.nickname}) ${props.address}` : props.address}
                            type="string"
                            label="Recipient"
                        />
                        <WalletSelect
                            wallets={props.wallets}
                            useSelectWalletHooks={useSelectWalletResult}
                            FormControlProps={{ fullWidth: true }}
                        />
                        <TokenSelect
                            FormControlProps={{ fullWidth: true }}
                            useSelectWalletHooks={useSelectWalletResult}
                        />
                        <TextField
                            InputProps={{ inputRef: amountInputRef }}
                            inputProps={{
                                min: 0,
                                max: amountMaxNumber,
                                className: classes.nativeInput,
                            }}
                            variant="filled"
                            fullWidth
                            defaultValue={amount}
                            type="number"
                            label="Amount"
                        />
                    </form>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <Typography variant="body2">
                        {selectedWallet
                            ? erc20Balance
                                ? `Balance: ${erc20Balance} (${ethBalance})`
                                : `Balance: ${ethBalance}`
                            : null}
                        <br />
                        Notice: A small gas fee will occur for publishing.
                    </Typography>
                    <Button
                        className={classes.button}
                        style={{ marginLeft: 'auto' }}
                        color="primary"
                        startIcon={props.loading ? <CircularProgress size={24} /> : null}
                        variant="contained"
                        disabled={isButtonDisabled || props.loading}
                        onClick={() =>
                            props.onTransfer({
                                amount,
                                address: useSelectWalletResult.selectedWalletAddress!,
                                token: useSelectWalletResult.selectedToken!,
                                tokenType: useSelectWalletResult.selectedTokenType,
                            })
                        }>
                        {isButtonDisabled
                            ? 'Not valid'
                            : `Transfer ${+amount.toFixed(3) === +amount.toFixed(9) ? '' : '~'}${+amount.toFixed(3)} ${
                                  selectedTokenType === EthereumTokenType.ETH ? 'ETH' : selectedToken?.symbol
                              }`}
                    </Button>
                </DialogActions>
            </ShadowRootDialog>
        </div>
    )
}

export interface TransferDialogProps extends TransferDialogUIProps {}

export function TransferDialog(props: TransferDialogProps) {
    const ui = getActivatedUI()
    const twitterClasses = {
        ...useTwitterDialog(),
        ...useTwitterButton(),
        ...useTwitterCloseButton(),
    }

    return ui.internalName === 'twitter' ? (
        <TransferDialogUI classes={twitterClasses} {...props} />
    ) : (
        <TransferDialogUI {...props} />
    )
}
