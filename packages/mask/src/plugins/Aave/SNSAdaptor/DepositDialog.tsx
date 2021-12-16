import { useState,useEffect , useMemo, useCallback} from 'react'
import { Box, Button, DialogActions, DialogContent, Link, Typography } from '@mui/material'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import { FormattedAddress, FormattedBalance, useValueRef } from '@masknet/shared'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ChainId, useChainId,  useAccount, useERC20TokenDetailed, useFungibleTokenBalance, EthereumTokenType,isZero,
    TransactionStateType,
    ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import type { Wallet } from '@masknet/web3-shared-evm'
import { formatBalance, formatEthereumAddress, resolveAddressLinkOnExplorer } from '@masknet/web3-shared-evm'
import TextField from '@mui/material/TextField';
import { ExternalLink } from 'react-feather'
import { TokenIcon } from '@masknet/shared'
import { useDepositCallback } from '../hooks/useDepositCallback'
import BigNumber from 'bignumber.js'
import { useRemoteControlledDialog } from '@masknet/shared'

import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { WalletMessages } from '../../Wallet/messages'


const useStyles = makeStyles()((theme) => ({
    section: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        ['& > p']: {
            fontSize: 16,
            lineHeight: '22px',
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            margin: '12px 0',
        },
    },
    tokenIcon: {
        width: 24,
        height: 24,
        marginRight: 4,
    },
    alert: {
        backgroundColor: MaskColorVar.twitterInfoBackground.alpha(0.1),
        color: MaskColorVar.twitterInfo,
        marginTop: 12,
        fontSize: 12,
        lineHeight: '16px',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertIcon: {
        color: MaskColorVar.twitterInfo,
    },
    button: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 600,
        padding: '13px 0',
        borderRadius:  12,
        height: 'auto',
    },
    content: {
        marginLeft: 40,
        marginRight: 40,
        paddingLeft: 0,
        paddingRight: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    actions: {
        marginLeft: 40,
        marginRight: 40,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 40,
    },
}))

export interface DepositDialogUIProps extends withClasses<never> {
    open: boolean
    inputTokenAddress: string
    onConfirm: () => void
    onClose?: () => void
    wallet?: Wallet
    apy: any,
	lendingPoolContractAddress: string
}

export function DepositDialogUI(props: DepositDialogUIProps) {
    
   
    const classes = useStylesExtends(useStyles(), props)
    const { open, wallet,apy,  inputTokenAddress, onConfirm, onClose , lendingPoolContractAddress} = props
	const chainId = useChainId()
	const account = useAccount()
    const [amountToInvest, setAmountToInvest] = useState('0')

    //#region pool token
    const {
        value: inputToken,
        loading: loadingToken,
        retry: retryToken,
        error: errorToken,
    } = useERC20TokenDetailed(inputTokenAddress)
    //#endregion

    function _handleAmountToInvestChange(e: any) {
        let s = e.target.value??'';
        if(s.trim()==''){
            s='0'
        }
        setAmountToInvest(s)
    }
	
		
	const amount = new BigNumber(amountToInvest || '0').shiftedBy(inputToken?.decimals ?? 0)
	const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        retry: retryLoadTokenBalance,
    } = useFungibleTokenBalance(inputToken?.type ?? EthereumTokenType.Native, inputToken?.address ?? '')
	
	
	const [depositState, depositCallback, resetDepositCallback] = useDepositCallback(lendingPoolContractAddress, inputToken!,amount.toFixed(), '0');
	
	// on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev: any) => {
                if (!ev.open) {
                    
                    if (depositState.type === TransactionStateType.HASH) {
						if(onClose){
							onClose()
						}
					}
                }
                if (depositState.type === TransactionStateType.HASH) setAmountToInvest('0')
                resetDepositCallback()
            },
            [ depositState, onClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (!inputToken ) return
        if (depositState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            
            state: depositState,
            summary: `Depositing ${formatBalance(amount, inputToken.decimals)}${inputToken.symbol} .`,
        })
    }, [depositState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return 'Pls connect a wallet'
        if (!amount || amount.isZero()) return 'Enter Amount' //t('plugin_aave_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance))
            return 'Insufficient balance'
        return ''
    }, [account, amount.toFixed(), inputToken, tokenBalance])
    //#endregion

	
    return (
        <div> 
            <InjectedDialog open={open} onClose={onClose} title="Deposit">
                <DialogContent className={classes.content}>
                    <Box className={classes.section}>
                        <Typography>
                            ({wallet?.name})
                            <FormattedAddress
                                address={wallet?.address ?? ''}
                                size={8}
                                formatter={formatEthereumAddress}
                            />
                            {wallet?.address ? (
                                <Link
                                    style={{ color: 'inherit', height: 20 }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={resolveAddressLinkOnExplorer(chainId, wallet.address)}>
                                    <ExternalLink style={{ marginLeft: 5 }} size={20} />
                                </Link>
                            ) : null}
                        </Typography>
                    </Box>
							
					<form className={classes.form} noValidate autoComplete="off">
                         <Typography component="div" display="flex">
                            <TokenIcon
                                classes={{ icon: classes.tokenIcon }}
                                address={inputToken?.address??''}
                                logoURI={inputToken?.logoURI}
                            />
                            
                        </Typography>
					    <TextField
							autoFocus
							margin="dense"
							id="amountToInvest"
							label="Amount"
							type="number"
							
							inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
							value={amountToInvest}
							onChange={_handleAmountToInvestChange}
							variant="standard"
						/>
						<span> {inputToken?.symbol}</span>	
                    </form>
                    <EthereumWalletConnectedBoundary>
                        {isZero(tokenBalance) ? (  // swap if zero balance
                            <ActionButton disabled
                                className={classes.button}
                                fullWidth
                                
                                variant="contained"
                                loading={loadingTokenBalance}>
                                Insufficient {inputToken?.symbol}
                            </ActionButton> 
                        ) : (
                            <EthereumERC20TokenApprovedBoundary
                                amount={amount.toFixed()}
                                spender={lendingPoolContractAddress}
                                token={inputToken?.type === EthereumTokenType.ERC20 ? inputToken : undefined}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage}
                                    onClick={depositCallback}
                                    variant="contained"
                                    loading={loadingTokenBalance}>
                                    {validationMessage || 'Deposit'}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                        )}
                    </EthereumWalletConnectedBoundary>
						
                    
                </DialogContent>
                
            </InjectedDialog>
        </div>
    )
}

export interface DepositDialogProps extends DepositDialogUIProps {}

export function DepositDialog(props: DepositDialogProps) {
    return <DepositDialogUI {...props} />
}
