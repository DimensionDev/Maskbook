import {
    createStyles,
    DialogContent,
    DialogProps,
    makeStyles,
    Typography,
    Box,
    Link,
    Checkbox,
    Button,
    Slider,
    TextField,
    Chip,
} from '@material-ui/core'
import classNames from 'classnames'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import { formatEthereumAddress } from '../../../plugins/Wallet/formatter'
import { resolveLinkOnEtherscan } from '../../../web3/pipes'
import { ChainId } from '../../../web3/types'
import { useState } from 'react'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { formatToken } from '../../Wallet/formatter'
import { TOKEN_ICON_LIST_TABLE } from './ITO'
import { SelectSwapTokenDialog } from './SelectSwapTokenDialog'
import ITO_ShareImage from '../assets/share_ito'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            display: 'flex',
            flexDirection: 'column',
            width: '95%',
            margin: '0 auto',
            paddingBottom: '1rem',
        },
        reminderText: {
            color: '#FF5555',
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1.5),
        },
        reminderTextLast: {
            marginBottom: 0,
        },
        tokenWrapper: {
            display: 'flex',
            alignItems: 'center',
            marginTop: theme.spacing(2),
            padding: '1rem 2rem',
            background: '#17191D',
            borderRadius: '15px',
        },
        tokenIcon: {
            width: 40,
            height: 40,
        },
        tokenTextWrapper: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '45px',
            marginLeft: '1rem',
        },
        tokenSymbol: {
            color: '#fff',
            fontSize: '18px',
            cursor: 'default',
        },
        tokenLink: {
            color: '#6F767C',
            fontSize: '15px',
            '&:hover': {
                textDecoration: 'none',
            },
        },
        comfirmWrapper: {
            marginTop: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
        },
        comfirmText: {
            color: '#6F767C',
        },
        button: {
            width: 'fit-content',
            margin: '0 auto',
        },
        providerWrapper: {
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'center',
        },
        providerBar: {},
        swapLimitWrap: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.spacing(2),
        },
        swapLimitText: {
            color: '#fff',
            fontSize: '14px',
            width: 'fit-content',
        },
        swapLimitSlider: {
            flexGrow: 1,
            width: 'auto !important',
            margin: theme.spacing(0, 3),
            '& .MuiSlider-thumb': {
                width: '28px',
                height: '28px',
                marginTop: '-12px',
                background: '#fff',
            },
            '& .MuiSlider-rail': {
                height: '5px',
            },
            '& .MuiSlider-track': {
                height: '5px',
            },
        },
        exchangeText: {
            marginTop: theme.spacing(1),
            color: '#6F767C',
        },
        exchangeAmountText: {
            color: '#fff',
        },
        swapWrapper: {
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            marginTop: theme.spacing(2),
            padding: theme.spacing(1, 1.5),
            border: '2px solid #2F3336',
            borderRadius: '15px',
        },
        swapHeader: {
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
        },
        swapBody: {
            position: 'relative',
            marginLeft: '4%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            marginTop: theme.spacing(2),
        },
        swapTextField: {
            flexGrow: 1,
            '-webkit-appearance': 'none',
            appearance: 'none',
            '& fieldset': {
                border: 'none',
            },
            '& input': {
                padding: '0 !important',
            },
            '& input[type=number]::-webkit-outer-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0,
            },
            '& input[type=number]::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0,
            },
        },
        swapTokenIcon: {
            width: 25,
            height: 25,
        },
        swapTextChip: {
            margin: theme.spacing(0, 1),
        },
        currentTokenText: {
            fontSize: 18,
            color: '#fff',
            padding: theme.spacing(0, 1),
            fontWeight: 300,
        },
        currentTokenArrow: {
            color: '#fff',
        },
        swapButtonWrapper: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: theme.spacing(2),
        },
        swapButton: {
            width: 'fit-content',
            margin: theme.spacing(0, 1),
        },
        shareImage: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundAttachment: 'local',
            backgroundPosition: '0',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            background: `url(${ITO_ShareImage})`,
            width: 475,
            height: 341,
            backgroundColor: '#332C61',
            borderRadius: 10,
        },
        shareWrapper: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: theme.spacing(2),
        },
        shareButton: {
            width: 'fit-content',
            padding: theme.spacing(1, 8),
            marginTop: theme.spacing(2),
        },
        shareAmount: {
            fontSize: 23,
            marginTop: 140,
        },
        shareToken: {
            fontSize: 23,
        },
        shareText: {
            fontSize: 24,
            marginTop: 80,
        },
    }),
)

export interface ClaimDialogProps extends withClasses<'root'> {
    open: boolean
    onClose: () => void
    exchangeTokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
    DialogProps?: Partial<DialogProps>
}

enum ClaimStatus {
    Remind,
    Swap,
    Share,
}

export function ClaimDialog(props: ClaimDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const ui_random_address = '0xc12d099be31567ad54e4e4d0d45691c3f58f5663'
    const ui_token_chain_id = ChainId.Rinkeby
    const [agreeReminder, setAgreeReminder] = useState(false)
    const [status, setStatus] = useState<ClaimStatus>(ClaimStatus.Swap)
    const [tokenAddress, setTokenAddress] = useState<string>(Object.keys(TOKEN_ICON_LIST_TABLE)[0])
    const [openSwapTokenDialog, setOpenSwapTokenDialog] = useState(false)
    const CurrentSwapTokenIcon = TOKEN_ICON_LIST_TABLE[tokenAddress]
    const ClaimTitle: EnumRecord<ClaimStatus, string> = {
        [ClaimStatus.Remind]: t('plugin_ito_dialog_claim_reminder_title'),
        [ClaimStatus.Swap]: t('plugin_ito_dialog_claim_swap_title', { token: 'MSKUI' }),
        [ClaimStatus.Share]: t('plugin_ito_dialog_claim_share_title'),
    }

    return (
        <>
            <InjectedDialog open={props.open} title={ClaimTitle[status]} onClose={props.onClose}>
                <DialogContent>
                    <Box className={classes.wrapper}>
                        {status === ClaimStatus.Remind ? (
                            <>
                                <Typography variant="body1" className={classes.reminderText}>
                                    {t('plugin_ito_dialog_claim_reminder_text1')}
                                </Typography>
                                <Typography variant="body1" className={classes.reminderText}>
                                    {t('plugin_ito_dialog_claim_reminder_text2')}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    className={classNames(classes.reminderText, classes.reminderTextLast)}>
                                    {t('plugin_ito_dialog_claim_reminder_text3')}
                                </Typography>
                                <section className={classes.tokenWrapper}>
                                    <TokenIcon address={ui_random_address} classes={{ icon: classes.tokenIcon }} />
                                    <div className={classes.tokenTextWrapper}>
                                        <Typography variant="h5" className={classes.tokenSymbol}>
                                            Symbolic name
                                        </Typography>

                                        <Link
                                            target="_blank"
                                            className={classes.tokenLink}
                                            rel="noopener noreferrer"
                                            href={`${resolveLinkOnEtherscan(
                                                ui_token_chain_id,
                                            )}/token/${ui_random_address}`}>
                                            <Typography variant="body2">
                                                {formatEthereumAddress(ui_random_address, 4)}(View on Etherscan)
                                            </Typography>
                                        </Link>
                                    </div>
                                </section>
                                <section className={classes.comfirmWrapper}>
                                    <Checkbox
                                        color="primary"
                                        checked={agreeReminder}
                                        onChange={(event) => {
                                            setAgreeReminder(event.target.checked)
                                        }}
                                    />
                                    <Typography variant="body1" className={classes.comfirmText}>
                                        {t('plugin_ito_dialog_claim_reminder_agree')}
                                    </Typography>
                                </section>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    onClick={() => setStatus(ClaimStatus.Swap)}
                                    disabled={!agreeReminder}>
                                    Continue
                                </Button>
                            </>
                        ) : status === ClaimStatus.Swap ? (
                            <>
                                <section className={classes.providerWrapper}>
                                    <EthereumStatusBar classes={{ root: classes.providerBar }} />
                                </section>
                                <section className={classes.swapLimitWrap}>
                                    <Typography variant="body1" className={classes.swapLimitText}>
                                        0 MSKUI
                                    </Typography>
                                    <Slider className={classes.swapLimitSlider} />
                                    <Typography variant="body1" className={classes.swapLimitText}>
                                        {formatToken(20000)} MSKUI
                                    </Typography>
                                </section>
                                <Typography variant="body1" className={classes.exchangeText}>
                                    {t('plugin_ito_dialog_claim_swap_exchange')}{' '}
                                    <span className={classes.exchangeAmountText}>600</span> MSKUI
                                </Typography>
                                <section className={classes.swapWrapper}>
                                    <div className={classes.swapHeader}>
                                        <Typography variant="body1">Swap</Typography>
                                        <Typography variant="body1">Balance: 9.0099</Typography>
                                    </div>
                                    <div className={classes.swapBody}>
                                        <TextField className={classes.swapTextField} autoFocus={true} type="number" />
                                        <Chip
                                            size="small"
                                            label="MAX"
                                            clickable
                                            className={classes.swapTextChip}
                                            color="primary"
                                            variant="outlined"
                                            onClick={() => {}}
                                        />

                                        <Button onClick={() => setOpenSwapTokenDialog(true)}>
                                            <CurrentSwapTokenIcon />{' '}
                                            <span className={classes.currentTokenText}>
                                                {props.exchangeTokens.find((t) => t.address === tokenAddress)!.symbol}
                                            </span>
                                            <KeyboardArrowDownIcon
                                                className={classes.currentTokenArrow}
                                                fontSize="large"
                                            />
                                        </Button>
                                    </div>
                                </section>
                                <section className={classes.swapButtonWrapper}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        className={classes.swapButton}
                                        onClick={() => setStatus(ClaimStatus.Share)}
                                        disabled={false}>
                                        {t('plugin_ito_dialog_claim_swap_approve')} USDC
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        className={classes.swapButton}
                                        onClick={() => setStatus(ClaimStatus.Swap)}
                                        disabled={true}>
                                        {t('plugin_ito_dialog_claim_swap_send')}
                                    </Button>
                                </section>
                            </>
                        ) : status === ClaimStatus.Share ? (
                            <>
                                <Box className={classes.shareWrapper}>
                                    <div className={classes.shareImage}>
                                        <Typography variant="body1" className={classes.shareAmount}>
                                            {formatToken(100000)}
                                        </Typography>
                                        <Typography variant="body1" className={classes.shareToken}>
                                            MSKUI
                                        </Typography>
                                        <Typography variant="body1" className={classes.shareText}>
                                            YOU GOT !
                                        </Typography>
                                    </div>
                                    <Button variant="contained" color="primary" className={classes.shareButton}>
                                        {t('plugin_ito_dialog_claim_share_title')}
                                    </Button>
                                </Box>
                            </>
                        ) : null}
                    </Box>
                    <SelectSwapTokenDialog
                        onSelect={(address: string) => {
                            setOpenSwapTokenDialog(false)
                            setTokenAddress(address)
                        }}
                        exchangeTokens={props.exchangeTokens}
                        open={openSwapTokenDialog}
                        onClose={() => setOpenSwapTokenDialog(false)}
                    />
                </DialogContent>
            </InjectedDialog>
        </>
    )
}
