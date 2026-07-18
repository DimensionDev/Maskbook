import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import type { SourceType } from '@masknet/web3-shared-base'
import { Stack } from '@mui/material'
import { SourceProviderIcon } from '../index.js'

const sourceList: SourceType[] = []

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
        <Stack direction="row" sx={{ justifyContent: 'flex-start', gap: 1 }}>
            {_sources.map((x) => {
                return (
                    <Stack
                        key={x}
                        onClick={() => handleClick(x)}
                        sx={{
                            display: 'inline-stack',
                            position: 'relative',
                            cursor: 'pointer',
                        }}>
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
