import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { makeStyles } from '@masknet/theme'
import { Add, Remove } from '@material-ui/icons'
import { FormattedAddress, FormattedBalance, ProviderIcon } from '@masknet/shared'
import { Box, Button, DialogContent, TextField, Typography } from '@material-ui/core'
import {
    formatBalance,
    useAccount,
    useProviderType,
    useChainId,
    useMaskBoxConstants,
    EthereumTokenType,
} from '@masknet/web3-shared'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import type { BoxInfo } from '../../type'
import { GasSettingBar } from '../../../Wallet/SNSAdaptor/GasSettingDialog/GasSettingBar'
import { TokenPrice } from '../../../../components/shared/TokenPrice'
import { useContainer } from 'unstated-next'
import { Context } from '../../hooks/useContext'
import { EthereumERC721TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC721TokenApprovedBoundary'

const useStyles = makeStyles()((theme) => ({
    main: {
        padding: `${theme.spacing(2.5)} !important`,
    },
    caption: {
        textAlign: 'center',
    },
    body: {
        padding: theme.spacing(0, 2.5),
    },
    value: {
        fontSize: 32,
        lineHeight: '40px',
        fontWeight: 'bold',
        marginBottom: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    section: {
        padding: theme.spacing(2, 0),
        justifyContent: 'space-between',
    },
    title: {
        width: '50%',
    },
    content: {},
    field: {
        borderRadius: 0,
        padding: theme.spacing(0),
        height: `25px !important`,
        minWidth: 0,
        minHeight: 0,
        outline: `none !important`,
        borderColor: `${theme.palette.divider} !important`,
    },
    textfield: {
        width: 40,
        textAlign: 'center',
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: theme.palette.divider,
            },
            '&:hover fieldset': {
                borderColor: theme.palette.divider,
            },
            '&.Mui-focused fieldset': {
                borderWidth: 1,
                borderColor: theme.palette.divider,
            },
        },
    },
    number: {
        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
            appearance: 'none',
            margin: 0,
        },
        padding: 0,
        appearance: 'textfield',
        textAlign: 'center',
        borderImage: 'none',
    },
}))

export interface DrawDialogProps {
    boxInfo: BoxInfo
    open: boolean
    onClose: () => void
    onSubmit: () => Promise<void>
}

export function DrawDialog(props: DrawDialogProps) {
    const { classes } = useStyles()
    const { boxInfo, open, onClose, onSubmit } = props

    const { MASK_BOX_CONTRACT_ADDRESS } = useMaskBoxConstants()

    const {
        contractDetailed,
        paymentCount,
        setPaymentCount,
        paymentTokenPrice,
        paymentTokenBalance,
        paymentTokenDetailed,
    } = useContainer(Context)

    const account = useAccount()
    const chainId = useChainId()
    const providerType = useProviderType()

    const onCount = useCallback(
        (step: number) => {
            setPaymentCount(paymentCount + step)
        },
        [paymentCount],
    )

    return (
        <InjectedDialog title="Draw" open={open} onClose={onClose}>
            <DialogContent className={classes.main}>
                <Box>
                    <Box className={classes.caption}>
                        <Typography color="textPrimary">
                            <span className={classes.value}>
                                <FormattedBalance
                                    symbol={''}
                                    value={new BigNumber(paymentTokenPrice).multipliedBy(paymentCount)}
                                    decimals={paymentTokenDetailed?.decimals ?? 0}
                                    significant={6}
                                />
                            </span>
                            <span>{paymentTokenDetailed?.symbol}</span>
                        </Typography>
                        {paymentTokenDetailed ? (
                            <Typography color="textPrimary">
                                <span>≈</span>
                                <TokenPrice
                                    chainId={chainId}
                                    amount={paymentTokenPrice}
                                    contractAddress={paymentTokenDetailed.address}
                                />
                            </Typography>
                        ) : null}
                    </Box>
                    <Box className={classes.body}>
                        <Box className={classes.section} display="flex" alignItems="center">
                            <Typography className={classes.title} color="textPrimary">
                                Mystery Boxes:
                            </Typography>
                            <Box className={classes.content} display="flex" alignItems="center">
                                <Button
                                    className={classes.field}
                                    variant="outlined"
                                    color="inherit"
                                    disabled={paymentCount <= 1}
                                    onClick={() => onCount(-1)}>
                                    <Remove color="inherit" />
                                </Button>
                                <TextField
                                    className={classes.textfield}
                                    type="number"
                                    size="small"
                                    sx={{ marginLeft: 1, marginRight: 1 }}
                                    value={paymentCount}
                                    onChange={(ev) => setPaymentCount(Number.parseInt(ev.target.value, 10))}
                                    InputProps={{
                                        classes: {
                                            root: classes.field,
                                        },
                                        autoFocus: true,
                                        inputProps: {
                                            className: classes.number,
                                            autoComplete: 'off',
                                            autoCorrect: 'off',
                                            title: 'Token Amount',
                                            inputMode: 'decimal',
                                            min: 0,
                                            minLength: 1,
                                            maxLength: boxInfo.personalLimit,
                                            pattern: '^[0-9]*[.,]?[0-9]*$',
                                            spellCheck: false,
                                        },
                                    }}
                                />
                                <Button
                                    className={classes.field}
                                    variant="outlined"
                                    color="inherit"
                                    disabled={paymentCount >= boxInfo.personalLimit}
                                    onClick={() => onCount(1)}>
                                    <Add color="inherit" />
                                </Button>
                            </Box>
                        </Box>
                        <Box className={classes.section} display="flex" alignItems="center">
                            <Typography className={classes.title} color="textPrimary">
                                Quantity Limit:
                            </Typography>
                            <Typography className={classes.content} color="textPrimary">
                                {boxInfo.personalLimit}
                                {boxInfo.tokenIdsPurchased.length
                                    ? ` (${boxInfo.personalLimit - boxInfo.tokenIdsPurchased.length} remaining)`
                                    : ''}
                            </Typography>
                        </Box>
                        <Box className={classes.section} display="flex" alignItems="center">
                            <Typography className={classes.title} color="textPrimary">
                                Current Wallet:
                            </Typography>
                            <Box className={classes.content} display="flex" alignItems="center">
                                <ProviderIcon size={16} providerType={providerType} />
                                <Typography color="textPrimary" sx={{ marginLeft: 1 }}>
                                    <FormattedAddress address={account} size={6} />
                                </Typography>
                            </Box>
                        </Box>
                        <Box className={classes.section} display="flex" alignItems="center">
                            <Typography className={classes.title} color="textPrimary">
                                Available:
                            </Typography>
                            <Box className={classes.content}>
                                <Typography color="textPrimary">
                                    {formatBalance(paymentTokenBalance, paymentTokenDetailed?.decimals ?? 0, 6)}{' '}
                                    {paymentTokenDetailed?.symbol}
                                </Typography>
                            </Box>
                        </Box>
                        <Box className={classes.section} display="flex" alignItems="center">
                            <Typography className={classes.title} color="textPrimary">
                                Gas Fee:
                            </Typography>
                            <Box className={classes.content}>
                                <GasSettingBar />
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <EthereumWalletConnectedBoundary>
                    <EthereumERC721TokenApprovedBoundary
                        owner={account}
                        contractDetailed={contractDetailed}
                        operator={MASK_BOX_CONTRACT_ADDRESS}
                        ActionButtonProps={{ size: 'medium', sx: { marginTop: 2 } }}>
                        <EthereumERC20TokenApprovedBoundary
                            amount={new BigNumber(paymentTokenPrice).multipliedBy(paymentCount).toFixed()}
                            spender={MASK_BOX_CONTRACT_ADDRESS}
                            token={
                                paymentTokenDetailed?.type === EthereumTokenType.ERC20
                                    ? paymentTokenDetailed
                                    : undefined
                            }
                            ActionButtonProps={{ size: 'medium', sx: { marginTop: 2 } }}>
                            <ActionButton
                                size="medium"
                                fullWidth
                                variant="contained"
                                sx={{ marginTop: 2 }}
                                onClick={onSubmit}>
                                Draw
                            </ActionButton>
                        </EthereumERC20TokenApprovedBoundary>
                    </EthereumERC721TokenApprovedBoundary>
                </EthereumWalletConnectedBoundary>
            </DialogContent>
        </InjectedDialog>
    )
}
