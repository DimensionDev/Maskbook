import { range } from 'lodash-es'
import type { FC, HTMLProps } from 'react'
import { CollectibleItemSkeleton } from './CollectibleItem.js'

interface Props extends HTMLProps<HTMLDivElement> {}

export const LoadingSkeleton: FC<Props> = ({ className }) => {
    return (
        <div className={className}>
            {range(3).map((i) => (
                <CollectibleItemSkeleton key={i} />
            ))}
        </div>
    )
}
