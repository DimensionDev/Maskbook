import React, { useState } from 'react'
import {
    makeStyles,
    createStyles,
    Theme,
    DialogTitle,
    IconButton,
    Typography,
    DialogContent,
    Divider,
    TextField,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    FormControl,
    Link,
    FormGroup,
    DialogActions,
} from '@material-ui/core'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../utils/i18n-next-ui'
import ShadowRootDialog from '../../utils/jss/ShadowRootDialog'
import { DialogDismissIconUI } from '../../components/InjectedComponents/DialogDismissIcon'
import AbstractTab from '../../extension/options-page/DashboardComponents/AbstractTab'
import { TokenSelect } from '../shared/TokenSelect'
import { WalletSelect } from '../shared/WalletSelect'
import { useSelectWallet } from '../shared/useWallet'
import type { WalletRecord, ERC20TokenRecord } from '../Wallet/database/types'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        form: { '& > *': { margin: theme.spacing(1, 0) } },
        helperText: {
            marginLeft: theme.spacing(4),
            marginTop: theme.spacing(-1.5),
        },
    }),
)
interface DonateCardProps {
    title: string
    description: string
    onDonate(): void
    open: boolean
    onClose(): void
    onRequireNewWallet: () => void
    wallets: WalletRecord[] | 'loading'
    tokens: ERC20TokenRecord[]
    address?: string
}
export function DonateCard(props: DonateCardProps) {
    const classes = useStyles()
    const { t } = useI18N()
    const [comment, setComment] = useState('')
    const [amount, setAmount] = useState(0)
    const [hideWalletAddr, setHideWalletAddr] = useState(false)
    const useSelectWalletResult = useSelectWallet(props.wallets, props.tokens, props.onRequireNewWallet)
    if (!props.address) return null
    return (
        <div className={classes.root}>
            <ShadowRootDialog
                open={props.open}
                scroll="body"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                onEscapeKeyDown={props.onClose}
                onExit={props.onClose}>
                <DialogTitle>
                    <IconButton onClick={props.onClose} size="small">
                        <DialogDismissIconUI />
                    </IconButton>
                    Gitcoin Grant
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Typography variant="h6">{props.title}</Typography>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                        {props.description}
                    </Typography>
                    <form className={classes.form}>
                        <WalletSelect
                            FormControlProps={{ fullWidth: true, variant: 'outlined' }}
                            wallets={props.wallets}
                            useSelectWalletHooks={useSelectWalletResult}></WalletSelect>
                        <TokenSelect
                            FormControlProps={{ fullWidth: true, variant: 'outlined' }}
                            useSelectWalletHooks={useSelectWalletResult}></TokenSelect>
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={amount}
                            inputProps={{ min: 0 }}
                            type="number"
                            label="Amount"
                            onChange={(e) => setAmount(parseFloat(e.currentTarget.value))}
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Comment (Public)"
                            multiline
                            value={comment}
                            rows={3}
                            onChange={(e) => setComment(e.currentTarget.value)}
                        />
                        <FormControl component="fieldset">
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value={hideWalletAddr}
                                            onChange={(e) => setHideWalletAddr(Boolean(e.currentTarget.value))}
                                            color="primary"
                                        />
                                    }
                                    label="Hide my wallet address"
                                />
                                <FormHelperText className={classes.helperText}>
                                    If this option is chosen, your wallet address will be hidden.
                                </FormHelperText>
                            </FormGroup>
                        </FormControl>
                        <Typography variant="body1">
                            By using this service, you'll also be contributing 5% of your contribution to the{' '}
                            <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://gitcoin.co/grants/86/gitcoin-sustainability-fund">
                                Gitcoin grants round 6+ development fund
                            </Link>
                        </Typography>
                    </form>
                </DialogContent>
                <DialogActions>
                    <ActionButton variant="contained" color="primary" width="30%" onClick={props.onDonate}>
                        Donate
                    </ActionButton>
                </DialogActions>
            </ShadowRootDialog>
        </div>
    )
}
