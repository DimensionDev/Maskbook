import React, { useState, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import Fuse from 'fuse.js'
import { uniqBy } from 'lodash-es'
import { MaskDialog } from '@dimensiondev/maskbook-theme'
import { TextField, DialogContent, InputAdornment } from '@material-ui/core'
import { Search } from '@material-ui/icons'

export interface MaskSearchableListProps<T> extends React.PropsWithChildren<{}> {
    data: T[]
    key?: keyof T
    title: string
    open: boolean
    loading?: boolean
    onSelect(selected: T): void
    onSearch?(data: T[], key: string): T[]
    searchKey?: string[]
}

export interface MaskSearchableListItemProps<T> extends React.PropsWithChildren<{}> {
    data: T
    index: number
    onSelect(item: T): void
}

interface FixSizeListItemProps<T> extends React.PropsWithChildren<{}> {
    data: {
        dataSet: T[]
        onSelect: any
    }
    index: number
    style: any
}

export const ItemInList = <T,>({ children, data, index, style }: FixSizeListItemProps<T>) => {
    return (
        <div style={style}>
            {React.createElement<MaskSearchableListItemProps<T>>(
                children as React.FunctionComponent<MaskSearchableListItemProps<T>>,
                { data: data.dataSet[index], index: index, onSelect: data.onSelect },
            )}
        </div>
    )
}

// todo: add i18n
// todo: import search icon
// todo: handle address search
// todo: improve getting data item keys for Fuse search key
export const SearchableList = <T,>({
    key,
    data,
    title,
    open,
    loading,
    children,
    onSelect,
    onSearch,
    searchKey,
}: MaskSearchableListProps<T>) => {
    const [keyword, setKeyword] = useState('')

    //#region fuse
    const fuse = useMemo(
        () =>
            new Fuse(data, {
                shouldSort: true,
                threshold: 0.45,
                minMatchCharLength: 1,
                keys: searchKey ?? Object.keys(data.length > 0 ? data[0] : []),
            }),
        [data],
    )
    //#endregion

    //#region create searched data
    const searchedData = useMemo(() => {
        if (!keyword) return data
        const filtered = [...(onSearch ? onSearch(data, keyword) : []), ...fuse.search(keyword).map((x: any) => x.item)]
        return key ? uniqBy(filtered, (x) => x[key]) : filtered
    }, [keyword, fuse, data])
    //#endregion

    return (
        <MaskDialog title={title} onClose={() => {}} open={open}>
            <DialogContent>
                <TextField
                    placeholder={'Search'}
                    autoFocus
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    onChange={(e) => setKeyword(e.currentTarget.value)}
                />
                <FixedSizeList
                    width="100%"
                    height={100}
                    overscanCount={4}
                    itemSize={50}
                    itemData={{
                        dataSet: searchedData,
                        onSelect: onSelect,
                    }}
                    itemCount={searchedData.length}>
                    {(props) => <ItemInList<T> {...props}>{children}</ItemInList>}
                </FixedSizeList>
            </DialogContent>
        </MaskDialog>
    )
}
