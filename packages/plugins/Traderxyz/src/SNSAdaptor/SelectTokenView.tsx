// /* eslint-disable no-restricted-imports */
// /* eslint-disable spaced-comment */
// /* eslint-disable eqeqeq */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { useI18N } from '../locales/i18n_generated'
import { InputTokenPanel } from '../../../../../packages/mask/src/plugins/Trader/SNSAdaptor/trader/InputTokenPanel'
import { TokenPanelType } from '../../../../../packages/mask/src/plugins/Trader/types'

import { noop } from 'lodash-unified'
import { DropIcon } from '../../../../icons/general'
import { useCallback, useState } from 'react'
import { usePickToken } from '@masknet/shared'
import {
    type FungibleTokenDetailed,
    ChainId,
    useFungibleTokenBalance,
    isSameAddress,
    EthereumTokenType,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { Grid, IconButton, Typography } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

interface SelectTokenView {
    chainId: ChainId
    onAmountChange: Function
    setDisplaySection: Function
    classes: Record<string, string>
    inputToken: FungibleTokenDetailed | null | undefined
    inputTokenAmount: string
}

export const SelectTokenView = (props: SelectTokenView): JSX.Element => {
    const t = useI18N()

    const { inputToken } = props
    console.log('inputToken=', inputToken)
    const [inputTokenBalance, setInputTokenBalance] = useState<string>('0')

    const chainId = props.chainId
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const excludeTokens = [inputToken].filter(Boolean).map((x) => x?.address) as string[]

    // #region update balance
    const { value: inputTokenBalance_, loading: loadingInputTokenBalance } = useFungibleTokenBalance(
        isSameAddress(inputToken?.address, NATIVE_TOKEN_ADDRESS)
            ? EthereumTokenType.Native
            : inputToken?.type ?? EthereumTokenType.Native,
        inputToken?.address ?? '',
        chainId,
    )

    const pickToken = usePickToken()
    const onTokenChipClick = useCallback(
        async (panelType: TokenPanelType) => {
            const picked = await pickToken({
                chainId,
                disableNativeToken: false,
                selectedTokens: excludeTokens,
            })
            if (picked) {
                console.log('picked=', picked)
                // setToken(picked)
                // #region update balance
                console.log('tokenBalance=', inputTokenBalance_)
                props.onAmountChange(picked, props.inputTokenAmount)
                // setInputTokenBalance(inputTokenBalance_)
            }
        },
        [excludeTokens.join(), chainId],
    )

    return (
        <div>
            <Grid item>
                <Grid container spacing={2} direction="row" justifyContent="flex-start" alignItems="center">
                    <Grid item>
                        <IconButton
                            size="large"
                            color="inherit"
                            sx={{ marginRight: '8px' }}
                            aria-label="back"
                            className={props.classes.backBtn}
                            onClick={() => {
                                props.setDisplaySection(true, false, false)
                            }}>
                            <ArrowBack />
                        </IconButton>
                    </Grid>
                    <Grid item xs={10}>
                        <Typography variant="h4" className={props.classes.mainTitle}>
                            What do you want to receive?
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <InputTokenPanel
                    chainId={chainId}
                    amount={props.inputTokenAmount}
                    balance={inputTokenBalance}
                    token={inputToken}
                    onAmountChange={(a: string) => {
                        /// setInputAmount(a)
                        props.onAmountChange(inputToken, a)
                    }}
                    SelectTokenChip={{
                        ChipProps: {
                            onClick: () => onTokenChipClick(TokenPanelType.Input),
                            deleteIcon: (
                                <DropIcon
                                    className={props.classes.dropIcon}
                                    style={{ fill: !inputToken ? '#ffffff' : undefined }}
                                />
                            ),
                            onDelete: noop,
                        },
                    }}
                />
            </Grid>
        </div>
    )
}
