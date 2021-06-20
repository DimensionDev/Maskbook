import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { uniqBy } from 'lodash-es'
import { MaskDialog } from '@dimensiondev/maskbook-theme'
import { TextField, DialogActions, DialogContent, DialogContentText, Button, InputAdornment } from '@material-ui/core'
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
        const filtered = [...(onSearch ? onSearch(data, keyword) : []), ...fuse.search(keyword).map((x) => x.item)]
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
                <DialogContentText>{children}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button>Confirm</Button>
            </DialogActions>
        </MaskDialog>
    )
}
