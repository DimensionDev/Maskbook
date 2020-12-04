import { createStyles, makeStyles, MenuProps } from '@material-ui/core'
import { useState, useCallback } from 'react'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
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

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            display: 'flex',
            margin: theme.spacing(1),
        },
        bar: {
            padding: theme.spacing(0, 2, 2),
        },
        input: {
            padding: theme.spacing(1),
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
    const [token, setFromToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>(tokenDetailed)

    const [message, setMessage] = useState('Best Wishes!')

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )
    const [selectedDate, setSelectedDate] = useState(new Date())

    const [amount, setAmount] = useState('0')

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
    console.log('******************')
    console.log(account)
    console.log(chainId)
    console.log(chainIdValid)
    console.log('*******************')
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING
    /*
    const [createSettings, createState, createCallback, resetCreateCallback] = useCreateCallback({
        password: uuid(),
        duration: 60 * 60 * 24,
        name: senderName,
        fromToken,
        toToken,
        message,
        end_date: selectedDate,
        total: allocationPerWallet,
        ratio,
    })

    const validationMessage = useMemo(() => {
        if (!fromToken) {
            return 'Select from token'
        }
        if (!toToken) {
            return 'select to token'
        }

        if (new BigNumber(ratio || '0').isZero()) {
            return 'Enter swap ratio'
        }
        if (new BigNumber(amount).isZero()) {
            return 'Enter amount'
        }
        if (new BigNumber(alloctionPerWallet || '0').isZero()) {
            return 'Enter allocation per wallet'
        }
        return ''
    }, [fromToken, toToken])
    */
    return (
        <>
            <EthereumStatusBar classes={{ root: classes.bar }} />
        </>
    )
}
