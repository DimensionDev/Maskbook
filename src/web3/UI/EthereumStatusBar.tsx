import React from 'react'
import { Box, makeStyles, createStyles, Theme, ChipProps } from '@material-ui/core'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { useChainId } from '../hooks/useChainState'
import { EthereumAccountChip } from './EthereumAccountChip'
import { EthereumChainChip } from './EthereumChainChip'
import { ChainId } from '../types'
import { useAccount } from '../hooks/useAccount'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        chainChip: {
            marginRight: theme.spacing(1),
        },
        accountChip: {},
    }),
)

export interface EthereumStatusBarProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    ChainChipProps?: Partial<ChipProps>
    AccountChipProps?: Partial<ChipProps>
}

export function EthereumStatusBar(props: EthereumStatusBarProps) {
    const { AccountChipProps, ChainChipProps } = props
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainId = useChainId()

    return (
        <Box className={classes.root} display="flex" alignItems="center" justifyContent="flex-end">
            {chainId === ChainId.Mainnet ? null : (
                <EthereumChainChip
                    classes={{ root: classes.chainChip }}
                    chainId={chainId}
                    ChipProps={{ variant: 'outlined', ...ChainChipProps }}
                />
            )}
            <EthereumAccountChip
                classes={{ root: classes.accountChip }}
                address={account}
                ChipProps={{ size: 'medium', variant: 'outlined', ...AccountChipProps }}
            />
        </Box>
    )
}
