import { ReactNode, useMemo, useState } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import Fuse from 'fuse.js'
import { uniqBy } from 'lodash-unified'
import { Box, InputAdornment } from '@mui/material'
import { makeStyles } from '../../UIHelper/makeStyles'
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
    itemRender: React.ComponentType<{ data: T; index: number; onSelect(): void }>
    /** The props to react-window */
    FixedSizeListProps?: Partial<FixedSizeListProps>
    /** The callback when clicked someone list item */
    onSelect?(selected: T): void
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
export function SearchableList<T extends {}>({
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

    // #region fuse
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
    // #endregion

    // #region create searched data
    const readyToRenderData = useMemo(() => {
        if (!keyword) return data
        const filtered = fuse.search(keyword).map((x: any) => x.item)
        return itemKey ? uniqBy(filtered, (x) => x[itemKey]) : filtered
    }, [keyword, fuse, data])
    // #endregion

    const handleSearch = (word: string) => {
        setKeyword(word)
        onSearch?.(word)
    }

    return (
        <div className={classes.container}>
            {!disableSearch && (
                <Box pt={0.5} style={{ padding: '0px 16px 16px' }}>
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
                <div className={classes.listBox}>
                    <FixedSizeList
                        className={classes.list}
                        width="100%"
                        height={height ?? 300}
                        overscanCount={25}
                        itemSize={itemSize ?? 100}
                        itemData={{
                            dataSet: readyToRenderData,
                            onSelect,
                        }}
                        itemCount={readyToRenderData.length}
                        {...rest}>
                        {(props) => (
                            <MaskSearchableItemInList<T> {...props}>{itemRender as any}</MaskSearchableItemInList>
                        )}
                    </FixedSizeList>
                </div>
            )}
        </div>
    )
}

const useStyles = makeStyles()((theme) => ({
    container: {
        overflow: 'hidden',
    },
    listBox: {
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.maskColor.secondaryLine,
            backgroundClip: 'padding-box',
        },
    },
    list: {
        scrollbarWidth: 'thin',
    },
}))

export interface MaskFixedSizeListProps extends FixedSizeListProps {}
