import React from 'react'

interface FixSizeListItemProps<T> extends React.PropsWithChildren<{}> {
    data: {
        dataSet: T[]
        onSelect: any
    }
    index: number
    style: any
}

export interface MaskSearchableListItemProps<T> extends React.PropsWithChildren<{}> {
    data: T
    index: number
    onSelect(item: T): void
}

export const MaskSearchableItemInList = <T,>({ children, data, index, style }: FixSizeListItemProps<T>) => (
    <div style={style}>
        {React.createElement(children as any, { data: data.dataSet[index], index, onSelect: data.onSelect })}
    </div>
)
