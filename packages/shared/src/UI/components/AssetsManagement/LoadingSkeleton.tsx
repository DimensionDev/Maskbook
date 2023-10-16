import type { HTMLProps } from 'react'
import { range } from 'lodash-es'
import { CollectibleItemSkeleton } from './CollectibleItem.js'
import { CollectionSkeleton } from './Collection.js'

interface LoadingSkeletonProps extends Pick<HTMLProps<HTMLDivElement>, 'className'> {}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={className}>
            {range(4).map((i) => (
                <CollectionSkeleton id={`ske-${i}`} count={4} key={`ske-${i}`} />
            ))}
            {range(12).map((i) => (
                <CollectibleItemSkeleton key={i} />
            ))}
        </div>
    )
}
