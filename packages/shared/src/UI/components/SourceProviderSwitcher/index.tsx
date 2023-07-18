import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { SourceType } from '@masknet/web3-shared-base'
import { Stack } from '@mui/material'
import { SourceProviderIcon } from '../index.js'

const sourceList = [SourceType.LooksRare, SourceType.OpenSea, SourceType.Rarible, SourceType.X2Y2]

interface SourceProviderSwitcherProps {
    // default is all
    sources?: SourceType[]
    selected: SourceType
    onSelect?(source: SourceType): void
}

const useStyles = makeStyles()((theme) => {
    return {
        selected: {
            position: 'absolute',
            left: '16px',
            top: '14px',
            borderRadius: '50%',
        },
    }
})

export function SourceProviderSwitcher({ sources, onSelect, selected }: SourceProviderSwitcherProps) {
    const { classes } = useStyles()
    const _sources = sources ?? sourceList
    const handleClick = (source: SourceType) => {
        onSelect?.(source)
    }

    return (
        <Stack justifyContent="flex-start" direction="row" gap={1}>
            {_sources.map((x) => {
                return (
                    <Stack
                        key={x}
                        display="inline-stack"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleClick(x)}
                        position="relative">
                        <SourceProviderIcon size={24} provider={x} />
                        {selected === x && (
                            <Stack className={classes.selected}>
                                <Icons.BorderedSuccess size={12} />
                            </Stack>
                        )}
                    </Stack>
                )
            })}
        </Stack>
    )
}
