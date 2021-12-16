import { ReactNode, useMemo, useState } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import Fuse from 'fuse.js'
import { uniqBy } from 'lodash-unified'
import { Box, InputAdornment } from '@mui/material'
import { makeStyles } from '../../makeStyles'
import { MaskColorVar } from '../../constants'
import { MaskSearchableItemInList } from './MaskSearchableItemInList'
import { MaskTextField, MaskTextFieldProps } from '../TextField'
import { SearchIcon } from '@masknet/icons'

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
    /** Props for search box */
    SearchFieldProps?: MaskTextFieldProps
    /** Show search bar */
    disableSearch?: boolean
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
    disableSearch,
    searchKey,
    itemRender,
    FixedSizeListProps = {},
    SearchFieldProps,
}: MaskSearchableListProps<T>) {
    const [keyword, setKeyword] = useState('')
    const { classes } = useStyles()
    const { height, itemSize, ...rest } = FixedSizeListProps
    const { InputProps, ...textFieldPropsRest } = SearchFieldProps ?? {}

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
            {!disableSearch && (
                <Box pt={0.5}>
                    <MaskTextField
                        placeholder="Search"
                        autoFocus
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            ...InputProps,
                        }}
                        onChange={(e) => handleSearch(e.currentTarget.value)}
                        {...textFieldPropsRest}
                    />
                </Box>
            )}
            {placeholder}
            {!placeholder && (
                <div className={classes.list}>
                    <FixedSizeList
                        width="100%"
                        height={height ?? 300}
                        overscanCount={5}
                        itemSize={itemSize ?? 60}
                        itemData={{
                            dataSet: readyToRenderData,
                            onSelect: onSelect,
                        }}
                        itemCount={readyToRenderData.length}
                        {...rest}>
                        {(props) => <MaskSearchableItemInList<T> {...props}>{itemRender}</MaskSearchableItemInList>}
                    </FixedSizeList>
                </div>
            )}
        </div>
    )
}
const useStyles = makeStyles()((theme) => ({
    container: {},
    list: {
        marginTop: theme.spacing(1.5),
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

export interface MaskFixedSizeListProps extends FixedSizeListProps {}
