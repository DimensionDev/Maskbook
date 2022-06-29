import React, { useCallback, useEffect } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Divider, Skeleton } from '@mui/material'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, formatGweiToWei, GasOption, Transaction } from '@masknet/web3-shared-evm'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { GasOption as GasOptionItem } from './GasOption'
import { SettingsContext } from './Context'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            boxShadow: `0px 0px 20px 0px ${theme.palette.mode === 'dark' ? '#FFFFFF1F' : '#0000000D'}`,
            backdropFilter: 'blur(16px)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            marginTop: theme.spacing(2),
        },
        content: {
            padding: theme.spacing(0, 2),
        },
        skeleton: {
            height: 201.5,
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
        },
        rectangle: {
            borderRadius: 8,
        },
    }
})

export interface GasOptionSelectorProps {
    chainId: ChainId
    options?: Record<GasOptionType, GasOption>
    onChange?: (option: Partial<Transaction>) => void
}

export function GasOptionSelector(props: GasOptionSelectorProps) {
    const { chainId, options, onChange } = props
    const { classes } = useStyles()
    const { gasOptionType, setGasOptionType } = SettingsContext.useContainer()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const isEIP1559 = Others?.chainResolver.isSupport(chainId, 'EIP1559')

    const onClick = useCallback(
        (type: GasOptionType, option: GasOption) => {
            setGasOptionType(type)
            onChange?.(
                isEIP1559
                    ? {
                          maxFeePerGas: formatGweiToWei(option.suggestedMaxFeePerGas).toFixed(),
                          maxPriorityFeePerGas: formatGweiToWei(option.suggestedMaxPriorityFeePerGas).toFixed(),
                      }
                    : {
                          gasPrice: formatGweiToWei(option.suggestedMaxFeePerGas).toFixed(),
                      },
            )
        },
        [isEIP1559, onChange],
    )

    useEffect(() => {
        if (!options || gasOptionType) return
        onClick(GasOptionType.NORMAL, options[GasOptionType.NORMAL])
    }, [gasOptionType, options])

    if (!options)
        return (
            <Box className={classes.root}>
                <div className={classes.skeleton}>
                    <Skeleton className={classes.rectangle} height={62} variant="rectangular" />
                    <Skeleton className={classes.rectangle} height={62} variant="rectangular" />
                    <Skeleton className={classes.rectangle} height={62} variant="rectangular" />
                </div>
            </Box>
        )

    return (
        <Box className={classes.root}>
            <div className={classes.content}>
                {Object.entries(options).map(([type, option], i) => {
                    const type_ = type as GasOptionType
                    return (
                        <React.Fragment key={type}>
                            {i === 0 ? null : <Divider />}
                            <GasOptionItem
                                type={type_}
                                option={option}
                                checked={type_ === gasOptionType}
                                onClick={() => onClick(type_, option)}
                            />
                        </React.Fragment>
                    )
                })}
            </div>
        </Box>
    )
}
