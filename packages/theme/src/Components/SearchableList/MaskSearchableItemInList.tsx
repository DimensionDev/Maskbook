import type { PropsWithChildren } from 'react'

interface FixSizeListItemProps<T> extends PropsWithChildren<{}> {
    data: {
        dataSet: T[]
        onSelect: any
    }
    index: number
    style: any
}

export interface MaskSearchableListItemProps<T> extends PropsWithChildren<{}> {
    data: T
    index: number
    onSelect(item: T): void
}

export function MaskSearchableItemInList<T>({ children, data, index, style }: FixSizeListItemProps<T>) {
    return (
        <div style={style}>
            {React.createElement(children as any, { data: data.dataSet[index], index, onSelect: data.onSelect })}
        </div>
    )
}
