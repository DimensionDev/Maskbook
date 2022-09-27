import type { FC, HTMLProps } from 'react'
import { range } from 'lodash-unified'
import { CollectibleItemSkeleton } from './CollectibleItem.js'

export interface LoadingSkeletonProps extends HTMLProps<HTMLDivElement> {}

export const LoadingSkeleton: FC<LoadingSkeletonProps> = ({ className }) => {
    return (
        <div className={className}>
            {range(3).map((i) => (
                <CollectibleItemSkeleton key={i} />
            ))}
        </div>
    )
}
