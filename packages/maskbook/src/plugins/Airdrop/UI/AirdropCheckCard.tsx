import { Box, createStyles, makeStyles, TextField, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useState, useCallback } from 'react'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import type { ERC20TokenDetailed } from '../../../web3/types'
import { formatBalance } from '../../Wallet/formatter'
import { CheckStateType, useCheckCallback } from '../hooks/useCheckCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(2.5),
            marginBottom: theme.spacing(1.5),
            fontSize: 13,
            color: '#fff',
        },
        textfield: {
            flex: 1,
            height: 56,
            color: '#fff !important',
            '& fieldset, & > div, & > div:hover, & > div:active': {
                color: '#fff !important',
                borderColor: '#F3F3F4 !important',
            },
        },
        helperText: {
            color: '#fff',
            fontSize: 12,
        },
        button: {
            background: 'rgba(255, 255, 255, .2)',
        },
    }),
)

export interface AirdropCheckCardProps extends withClasses<never> {
    token?: ERC20TokenDetailed
}

export function AirdropCheckCard(props: AirdropCheckCardProps) {
    const { token } = props
    const classes = useStylesExtends(useStyles(), props)

    //#region check callback
    const [checkAddress, setCheckAddress] = useState('')
    const [checkState, checkCallback, resetCheckCallback] = useCheckCallback()
    const onCheckButtonClick = useCallback(() => {
        if (checkState.type === CheckStateType.PENDING) return
        checkCallback(checkAddress)
    }, [checkState, checkAddress, checkCallback])
    //#endregion

    if (!token) return null

    return (
        <Box className={classes.root}>
            <Typography>Check Address</Typography>
            <Box sx={{ marginTop: 1.2, display: 'flex', alignItems: 'center' }}>
                <TextField
                    classes={{ root: classes.textfield }}
                    value={checkAddress}
                    variant="outlined"
                    error={checkState.type === CheckStateType.FAILED}
                    helperText={
                        <Typography
                            className={classes.helperText}
                            style={{
                                color: (() => {
                                    switch (checkState.type) {
                                        case CheckStateType.YEP:
                                            return '#77E0B5'
                                        case CheckStateType.PENDING:
                                            return '#ffffff'
                                        default:
                                            return '#FF5555'
                                    }
                                })(),
                            }}>
                            {(() => {
                                switch (checkState.type) {
                                    case CheckStateType.YEP:
                                        return `The address has ${checkState.packet.amount}.00 ${token.symbol} to claim.`
                                    case CheckStateType.NOPE:
                                        return 'The address has no reward to claim.'
                                    case CheckStateType.CLAIMED:
                                        return 'The address has already claimed the reward.'
                                    case CheckStateType.FAILED:
                                        return checkState.error.message ?? 'Failed to check the reward.'
                                    case CheckStateType.PENDING:
                                        return 'Checking in progress...'
                                    default:
                                        return ''
                                }
                            })()}
                        </Typography>
                    }
                    onChange={(e) => setCheckAddress(e.target.value)}
                    placeholder="Enter the wallet address."
                    inputProps={{
                        maxLength: 42,
                    }}
                />
                <Box marginLeft={2.5} paddingY={0.5}>
                    <ActionButton
                        className={classes.button}
                        variant="contained"
                        loading={checkState.type === CheckStateType.PENDING}
                        disabled={!checkAddress}
                        onClick={onCheckButtonClick}>
                        Check
                    </ActionButton>
                </Box>
            </Box>
        </Box>
    )
}
