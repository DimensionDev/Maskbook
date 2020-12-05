import { createStyles, makeStyles, MenuProps, Box, TextField } from '@material-ui/core'
import { useState, useCallback, useMemo } from 'react'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { EthereumTokenType, ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'

import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'

import { ITOExchangeTokenPanel, ExchangeTokenPanel, ExchangeTokenItem } from './ITOSelect'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import BigNumber from 'bignumber.js'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            margin: theme.spacing(1),
        },
        flow: {
            margin: theme.spacing(1),
            textAlign: 'center',
        },
        bar: {
            padding: theme.spacing(0, 2, 2),
        },
        input: {
            padding: theme.spacing(1),
            flex: 1,
        },
        tip: {
            fontSize: 12,
            color: theme.palette.text.secondary,
        },
        button: {
            margin: theme.spacing(2, 0),
            padding: 12,
        },
    }),
)

export interface ITOFormProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onCreate?(payload: any): void
    SelectMenuProps?: Partial<MenuProps>
}

export function ITOForm(props: ITOFormProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()

    const { value: tokenDetailed } = useEtherTokenDetailed()
    const [token, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>(tokenDetailed)

    const [message, setMessage] = useState('Best Wishes!')

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )
    const [selectedDate, setSelectedDate] = useState(new Date())

    const [amount, setAmount] = useState('')

    const senderName = useCurrentIdentity()?.linkedPersona?.nickname ?? 'Unknown User'

    const ITOContractAddress = useConstant(ITO_CONSTANTS, 'ITO_ADDRESS')
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        token?.type === EthereumTokenType.ERC20 ? token.address : '',
        amount,
        ITOContractAddress,
    )

    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) {
            return
        }
        await approveCallback()
    }, [approveState, approveCallback])

    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING

    const validationMessage = useMemo(() => {
        if (new BigNumber(amount).isZero()) {
            return 'Enter an amount'
        }
        if (!token) {
            return 'Select to token'
        }
        return ''
    }, [token, amount])

    const [exchangeTokens, setExchangeTokens] = useState([])
    const [tokenAmount, setTokenAmount] = useState<ExchangeTokenItem>({ amount: '0', token: null })
    return (
        <>
            <EthereumStatusBar classes={{ root: classes.bar }} />
            <Box className={classes.line}>
                <ExchangeTokenPanel
                    onChange={setTokenAmount}
                    exchangeToken={tokenAmount}
                    showAdd={false}
                    showRemove={false}
                    index={0}
                    label="Total amount"
                    amount={amount}
                    setAmount={setAmount}
                />
            </Box>
            <Box className={classes.flow}>
                <ArrowDownwardIcon size="large" />
            </Box>
            <Box className={classes.line}>
                <ITOExchangeTokenPanel
                    token={token}
                    onChange={setExchangeTokens}
                    exchangetokenPanelProps={{
                        label: 'Swap Ration',
                    }}
                />
            </Box>
            <Box className={classes.line}>
                <TextField className={classes.input} fullWidth label="Title" defalutValue="MASK" />
            </Box>
            <Box className={classes.line} style={{ display: 'flex' }}>
                <TextField className={classes.input} label="Allocation per wallet" />
                <TextField className={classes.input} label="Event Times" />
            </Box>
            {!account || !chainIdValid ? (
                <ActionButton className={classes.button} fullWidth variant="contained" size="large">
                    'Connect a wallet'
                </ActionButton>
            ) : validationMessage ? (
                <ActionButton className={classes.button} fullWidth variant="contained" disabled>
                    {validationMessage}
                </ActionButton>
            ) : (
                <ActionButton className={classes.button} fullWidth onClick={createCallback}>
                    {`Send ${formatBalance(totalAmount, token.decimals ?? 0, token.decimals ?? 0)} ${token.symbol}`}
                </ActionButton>
            )}
        </>
    )
}
