import { Icons } from '@masknet/icons'
import { SourceType } from '@masknet/web3-shared-base'
import { Stack } from '@mui/material'

const SourceIconMapping = [
    {
        source: SourceType.NFTScan,
        icon: <Icons.NFTScan />,
    },
    {
        source: SourceType.OpenSea,
        icon: <Icons.OpenSea />,
    },
    {
        source: SourceType.Rarible,
        icon: <Icons.Rarible />,
    },
]

interface SourceIconsProps {
    // default is all
    sources?: SourceType[]
    onSelect?(source: SourceType): void
}

export const SourceIcons = ({ sources, onSelect }: SourceIconsProps) => {
    const _sources = SourceIconMapping.filter((x) => (sources ? sources.includes(x.source) : true))

    return (
        <Stack justifyContent="flex-start" direction="row" gap={1}>
            {_sources.map((x) => {
                return (
                    <Stack
                        key={x.source}
                        display="inline-stack"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => onSelect?.(x.source)}>
                        {x.icon}
                    </Stack>
                )
            })}
        </Stack>
    )
}
