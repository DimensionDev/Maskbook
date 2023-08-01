import { range } from 'lodash-es'
import type { HTMLProps } from 'react'
import { CollectibleItemSkeleton } from './CollectibleItem.js'

interface Props extends Pick<HTMLProps<HTMLDivElement>, 'className'> {}

export function LoadingSkeleton({ className }: Props) {
    return (
        <div className={className}>
            {range(7).map((i) => (
                <CollectibleItemSkeleton key={i} />
            ))}
        </div>
    )
}
