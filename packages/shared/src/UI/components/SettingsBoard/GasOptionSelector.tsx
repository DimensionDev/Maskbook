import { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Divider } from '@mui/material'
import { useSharedI18N } from '@masknet/shared'
import { GasOptionType } from '@masknet/web3-shared-base'
import { GasOption, GasOptionItem } from './GasOption'

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
    options: Array<GasOption>
    onChange?: (option: GasOption) => void
}

export function GasOptionSelector(props: GasOptionSelectorProps) {
    const { options, onChange } = props
    const { classes } = useStyles()
    const t = useSharedI18N()
    const [selectedOptionType, setSelectedOptionType] = useState(GasOptionType.NORMAL)

    return (
        <Box className={classes.root}>
            <div className={classes.content}>
                {options.map((x, i) => (
                    <>
                        {i === 0 ? null : <Divider />}
                        <GasOptionItem
                            {...x}
                            checked={x.type === selectedOptionType}
                            onClick={() => {
                                setSelectedOptionType(x.type)
                                onChange?.(x)
                            }}
                        />
                    </>
                ))}
            </div>
        </Box>
    )
}
