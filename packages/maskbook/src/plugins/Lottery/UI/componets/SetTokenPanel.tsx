import React from 'react'
import { makeStyles, Theme, createStyles, Typography, Box } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { SelectTokenChip, SelectTokenChipProps } from '../../../../web3/UI/SelectTokenChip'
import { formatBalance } from '../../../Wallet/formatter'
import type { Token } from '../../../../web3/types'
import { useStylesExtends } from '../../../../components/custom-ui-helper'

/***
 * TO-DO: move to public shared UI components
 * */
const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        token: {
            whiteSpace: 'pre',
            maxWidth: 300,
            paddingLeft: theme.spacing(1),
        },
        balance: {
            fontSize: 12,
            margin: theme.spacing(1),
        },
    })
})

export interface SetTokenPanelProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    balance: string
    label?: string
    token?: Token | null
    SelectTokenChip?: Partial<SelectTokenChipProps>
}

export function SetTokenPanel(props: SetTokenPanelProps) {
    const { balance, token } = props

    const classes = useStylesExtends(useStyles(), props)
    return token ? (
        <div>
            <Typography className={classes.balance} color="textSecondary" variant="body2" component="span">
                Balance: {formatBalance(new BigNumber(balance), token.decimals, 6)}
            </Typography>
            <Box display="inline">
                <SelectTokenChip token={token} {...props.SelectTokenChip} />
            </Box>
        </div>
    ) : (
        <div>
            <Typography className={classes.balance} color="textSecondary" variant="body2" component="span">
                -
            </Typography>
            <SelectTokenChip token={token} {...props.SelectTokenChip} />
        </div>
    )
}
