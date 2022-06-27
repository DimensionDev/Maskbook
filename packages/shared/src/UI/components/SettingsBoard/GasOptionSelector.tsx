import React, { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Divider } from '@mui/material'
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
    }
})

export interface GasOptionSelectorProps {
    options?: Record<GasOptionType, Web3Helper.GasOptionAll>
    onChange?: (type: GasOptionType, option: Web3Helper.GasOptionAll) => void
}

export function GasOptionSelector(props: GasOptionSelectorProps) {
    const { options, onChange } = props
    const { classes } = useStyles()
    const { gasOptionType, setGasOptionType } = SettingsContext.useContainer()

    if (!options) return null

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
                                    onChange?.(type_, option)
                                }}
                            />
                        </React.Fragment>
                    )
                })}
            </div>
        </Box>
    )
}
