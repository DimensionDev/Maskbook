import React from 'react'
import { Box, makeStyles, createStyles, Theme, ChipProps, BoxProps } from '@material-ui/core'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { useChainId, useChainIdValid } from '../hooks/useChainState'
import { EthereumAccountChip } from './EthereumAccountChip'
import { EthereumChainChip } from './EthereumChainChip'
import { useAccount } from '../hooks/useAccount'
import { ChainId } from '../types'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
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
    const chainIdValid = useChainIdValid()

    if (!account) return null

    return (
        <Box className={classes.root} {...BoxProps}>
            {chainId !== ChainId.Mainnet && chainIdValid ? (
                <EthereumChainChip
                    classes={{ root: classes.chainChip }}
                    chainId={chainId}
                    ChipProps={{ variant: 'outlined', ...ChainChipProps }}
                />
            ) : null}
            <EthereumAccountChip
                classes={{ root: classes.accountChip }}
                ChipProps={{ size: 'medium', variant: 'outlined', clickable: true, ...AccountChipProps }}
            />
        </Box>
    )
}
