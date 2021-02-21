import { useState, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { createStyles, makeStyles, Typography } from '@material-ui/core'
import RefreshIcon from '@material-ui/icons/Refresh'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { BreakdownDialog } from '../../components/InjectedComponents/BreakdownDialog'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { formatBalance } from '../../plugins/Wallet/formatter'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import { useERC20TokenBalance } from '../hooks/useERC20TokenBalance'
import { useERC20TokenDetailed } from '../hooks/useERC20TokenDetailed'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            borderRadius: 16,
            fontWeight: 300,
            backgroundColor: '#1C68F3',
            '&:hover, &:active': {
                backgroundColor: '#1C68F3',
            },
        },
        icon: {
            border: `solid 1px ${theme.palette.common.white}`,
            borderRadius: '50%',
            marginRight: theme.spacing(0.5),
        },
    })
})

export interface EthereumMaskBalanceButtonProps extends withClasses<'root'> {}

export function EthereumMaskBalanceButton(props: EthereumMaskBalanceButtonProps) {
    const classes = useStylesExtends(useStyles(), props)

    //#region token detailed
    const MASK_ADDRESS = useConstant(CONSTANTS, 'MASK_ADDRESS')
    const {
        value: maskToken,
        error: maskTokenError,
        loading: maskTokenLoading,
        retry: maskTokenRetry,
    } = useERC20TokenDetailed(MASK_ADDRESS)
    const {
        value: maskBalance = '0',
        error: maskBalanceError,
        loading: maskBalanceLoading,
        retry: maskBalanceRetry,
    } = useERC20TokenBalance(MASK_ADDRESS)
    //#endregion

    //#region breakdown dialog
    const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false)
    const onMaskbookIconClicked = useCallback(() => {
        if (maskBalanceError) maskBalanceRetry()
        if (maskTokenError) maskTokenRetry()
        else setBreakdownDialogOpen(true)
    }, [maskBalanceError, maskTokenError, maskBalanceRetry, maskTokenRetry])
    const onBreakdownDialogClose = useCallback(() => {
        setBreakdownDialogOpen(false)
    }, [])
    //#endregion

    return (
        <>
            <ActionButton
                className={classes.root}
                variant="contained"
                color="primary"
                loading={maskBalanceLoading || maskTokenLoading}
                onClick={onMaskbookIconClicked}>
                {process.env.architecture === 'web' && (maskBalanceError || maskTokenError) ? <RefreshIcon /> : null}
                {process.env.architecture === 'web' &&
                !maskBalanceLoading &&
                !maskTokenLoading &&
                !maskBalanceError &&
                !maskTokenError ? (
                    <MaskbookIcon className={classes.icon} />
                ) : null}
                <Typography>{formatBalance(new BigNumber(maskBalance), 18, 6)} MASK</Typography>
            </ActionButton>
            {maskToken ? (
                <BreakdownDialog
                    open={breakdownDialogOpen}
                    token={maskToken}
                    balance={maskBalance}
                    onClose={onBreakdownDialogClose}
                />
            ) : null}
        </>
    )
}
