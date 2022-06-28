import React, { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Divider, Skeleton } from '@mui/material'
import type { GasOptionType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { GasOption } from './GasOption'
import { SettingsContext } from './Context'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
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
    options?: Record<GasOptionType, Web3Helper.GasOptionAll>
    onChange?: (option: Web3Helper.GasOptionAll) => void
}

export function GasOptionSelector(props: GasOptionSelectorProps) {
    const { options, onChange } = props
    const { classes } = useStyles()
    const { gasOptionType, setGasOptionType } = SettingsContext.useContainer()

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
                            <GasOption
                                type={type_}
                                option={option}
                                checked={type_ === gasOptionType}
                                onClick={() => {
                                    setGasOptionType(type_)
                                    onChange?.(option)
                                }}
                            />
                        </React.Fragment>
                    )
                })}
            </div>
        </Box>
    )
}
