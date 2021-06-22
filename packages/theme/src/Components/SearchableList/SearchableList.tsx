import React, { useState, useMemo, ReactNode } from 'react'
import { FixedSizeList } from 'react-window'
import Fuse from 'fuse.js'
import { uniqBy } from 'lodash-es'
import { TextField, InputAdornment, Typography } from '@material-ui/core'
import { Search } from '@material-ui/icons'
import { makeStyles, Theme } from '@material-ui/core/styles'

export interface MaskSearchableListProps<T> {
    data: T[]
    key?: keyof T
    status?: ReactNode
    onSelect(selected: T): void
    onSearch?(data: T[], key: string): T[]
    searchKey?: string[]
    itemRender: ReactNode
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

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        paddingBottom: '30px',
    },
    textField: {
        // todo: move color to theme
        '&>div': {
            borderRadius: '8px',
            background: '#F3F3F4',
        },
    },
    searchInput: {
        padding: '-6px',
    },
    list: {
        marginTop: '6px',
        '& > div::-webkit-scrollbar': {
            width: '7px',
        },
        '& > div::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '& > div::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: '#F3F3F4',
        },
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        fontSize: 16,
    },
}))

export const SearchableList = <T,>({
    key,
    data,
    status,
    onSelect,
    onSearch,
    searchKey,
    itemRender,
}: MaskSearchableListProps<T>) => {
    const [keyword, setKeyword] = useState('')
    const classes = useStyles()

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
        <div className={classes.container}>
            <TextField
                className={classes.textField}
                placeholder={'Search'}
                autoFocus
                fullWidth
                InputProps={{
                    className: classes.searchInput,
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
                onChange={(e) => setKeyword(e.currentTarget.value)}
            />
            {status && (
                <Typography className={classes.placeholder} color="textSecondary">
                    {status}
                </Typography>
            )}
            {!status && (
                <div className={classes.list}>
                    <FixedSizeList
                        width="100%"
                        height={300}
                        overscanCount={5}
                        itemSize={60}
                        itemData={{
                            dataSet: searchedData,
                            onSelect: onSelect,
                        }}
                        itemCount={searchedData.length}>
                        {(props) => <ItemInList<T> {...props}>{itemRender}</ItemInList>}
                    </FixedSizeList>
                </div>
            )}
        </div>
    )
}
