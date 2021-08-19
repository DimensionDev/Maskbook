import { ReactNode, useMemo, useState } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import Fuse from 'fuse.js'
import { uniqBy } from 'lodash-es'
import { InputAdornment, TextField } from '@material-ui/core'
import { makeStyles } from '../../makeStyles'
import { Search } from '@material-ui/icons'
import { MaskColorVar } from '../../constants'
import { MaskSearchableItemInList } from './MaskSearchableItemInList'

export interface MaskSearchableListProps<T> {
    /** The list data should be render */
    data: T[]
    /** The identity of list data item for remove duplicates item */
    itemKey?: keyof T
    /** Intermediate state when data is loaded */
    placeholder?: ReactNode
    /** The key of list item for search */
    searchKey?: string[]
    /** Renderer for each list item */
    itemRender: ReactNode
    /** The props to react-window */
    FixedSizeListProps?: Partial<FixedSizeListProps>
    /** The callback when clicked someone list item */
    onSelect(selected: T): void
    /** The hook when search */
    onSearch?(key: string): void
}

/**
 * This component is used to provide a searchable list in Mask design.
 *
 * @example
 * interface IListDate { name: string }
 * const ListItem = ({ name }: IListDate) => <div>{ name }</div>
 * const onSelect = () => {}
 *
 * return (
 *      <SearchableList<IListDate>
 *           onSelect={onSelect}
 *           data={ListData}
 *           searchKey={['name']}
 *           itemRender={ListItem}
 *      />
 * )
 */
export function SearchableList<T>({
    itemKey,
    data,
    placeholder,
    onSelect,
    onSearch,
    searchKey,
    itemRender,
    FixedSizeListProps,
}: MaskSearchableListProps<T>) {
    const [keyword, setKeyword] = useState('')
    const { classes } = useStyles()
    //#region fuse
    const fuse = useMemo(
        () =>
            new Fuse(data, {
                shouldSort: true,
                threshold: 0.45,
                minMatchCharLength: 1,
                keys: searchKey ?? Object.keys(data.length > 0 ? data[0] : []),
            }),
        [data, searchKey],
    )
    //#endregion

    //#region create searched data
    const readyToRenderData = useMemo(() => {
        if (!keyword || onSearch) return data
        const filtered = [...fuse.search(keyword).map((x: any) => x.item)]
        return itemKey ? uniqBy(filtered, (x) => x[itemKey]) : filtered
    }, [keyword, fuse, data])
    //#endregion

    const handleSearch = (word: string) => {
        setKeyword(word)
        onSearch?.(word)
    }

    return (
        <div className={classes.container}>
            <TextField
                className={classes.textField}
                placeholder="Search"
                autoFocus
                fullWidth
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
                onChange={(e) => handleSearch(e.currentTarget.value)}
            />
            {placeholder}
            {!placeholder && (
                <div className={classes.list}>
                    <FixedSizeList
                        width="100%"
                        height={300}
                        overscanCount={5}
                        itemSize={60}
                        itemData={{
                            dataSet: readyToRenderData,
                            onSelect: onSelect,
                        }}
                        itemCount={readyToRenderData.length}
                        {...FixedSizeListProps}>
                        {(props) => <MaskSearchableItemInList<T> {...props}>{itemRender}</MaskSearchableItemInList>}
                    </FixedSizeList>
                </div>
            )}
        </div>
    )
}
const useStyles = makeStyles()((theme) => ({
    container: {
        paddingBottom: theme.spacing(4),
    },
    textField: {
        '&>div': {
            borderRadius: theme.spacing(1),
            background: MaskColorVar.normalBackground,
        },
    },
    list: {
        marginTop: theme.spacing(1),
        '& > div::-webkit-scrollbar': {
            width: '7px',
        },
        '& > div::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '& > div::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: MaskColorVar.normalBackground,
        },
    },
}))
