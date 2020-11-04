import React from 'react'
import { Box, makeStyles, createStyles, Theme, ChipProps, BoxProps } from '@material-ui/core'
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
            margin: theme.spacing(0, 1),
        },
        accountChip: {},
    }),
)

export interface EthereumStatusBarProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    BoxProps?: Partial<BoxProps>
    ChainChipProps?: Partial<ChipProps>
    AccountChipProps?: Partial<ChipProps>
}

export function EthereumStatusBar(props: EthereumStatusBarProps) {
    const { BoxProps, AccountChipProps, ChainChipProps } = props
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainId = useChainId()

    if (!account) return null
    return (
        <Box className={classes.root} display="flex" alignItems="center" justifyContent="flex-end" {...BoxProps}>
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
                ChipProps={{ size: 'medium', variant: 'outlined', clickable: true, ...AccountChipProps }}
            />
        </Box>
    )
}
