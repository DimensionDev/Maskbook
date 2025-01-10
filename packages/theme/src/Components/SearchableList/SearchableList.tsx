import { useCallback, useMemo, useState, type HTMLProps } from 'react'
import { FixedSizeList, type FixedSizeListProps, type ListChildComponentProps } from 'react-window'
import Fuse from 'fuse.js'
import { uniqBy } from 'lodash-es'
import { Box, Stack, Typography, useTheme } from '@mui/material'
import { makeStyles } from '../../UIHelper/index.js'
import { MaskTextField, type MaskTextFieldProps } from '../TextField/index.js'
import { Icons } from '@masknet/icons'
import { EmptyResult } from './EmptyResult.js'
import { LoadingBase } from '../LoadingBase/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        gap: theme.spacing(2),
    },
    listBox: {
        flexGrow: 1,
        minHeight: 0,
        overflow: 'auto',
        '& > div': {
            scrollbarWidth: 'none',
        },
        '& > div::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 0,
        },
        '& > div::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.maskColor.secondaryLine,
            backgroundClip: 'padding-box',
        },
        '& > div > div': {
            position: 'relative',
            margin: 'auto',
        },
    },
    list: {
        scrollbarWidth: 'none',
    },
    error: {
        backgroundColor: theme.palette.maskColor.bottom,
        fontSize: 14,
        color: theme.palette.maskColor.danger,
    },
}))

export interface MaskSearchableListProps<T>
    extends withClasses<'listBox' | 'searchInput'>,
        Omit<HTMLProps<HTMLDivElement>, 'data' | 'onSelect'> {
    /** The list data should be render */
    data: T[]
    /** The identity of list data item for remove duplicates item */
    itemKey?: keyof T
    /** The key of list item for search */
    searchKey?: string[]
    /** Renderer for each list item */
    itemRender: React.ComponentType<ListChildComponentProps>
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
    loading?: boolean
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
 * @todo
 * Move to `shared` package, so that we can use LoadingStatus and EmptyStatus inside.
 */
export function SearchableList<T extends object>({
    itemKey,
    data,
    onSelect,
    onSearch,
    disableSearch,
    loading,
    searchKey,
    itemRender,
    FixedSizeListProps,
    SearchFieldProps,
    ...props
}: MaskSearchableListProps<T>) {
    const [keyword, setKeyword] = useState('')
    const theme = useTheme()
    const { classes, cx } = useStyles(undefined, { props })
    const { height = 300, itemSize, ...rest } = FixedSizeListProps || {}
    const { InputProps, ...textFieldPropsRest } = SearchFieldProps ?? {}

    const fuse = useMemo(() => {
        return new Fuse(data, {
            shouldSort: true,
            isCaseSensitive: false,
            threshold: 0.45,
            minMatchCharLength: 1,
            keys: searchKey ?? Object.keys(data.length > 0 ? data[0] : []),
        })
    }, [searchKey, data])

    // #region create searched data
    const readyToRenderData = useMemo(() => {
        if (!keyword) return data

        const filtered = fuse.search(keyword).map((x: any) => x.item)
        return itemKey ? uniqBy(filtered, (x) => x[itemKey]) : filtered
    }, [keyword, fuse, data])
    // #endregion

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value
        setKeyword(value)
        onSearch?.(value)
        if (!value) handleClear()
    }

    const handleClear = () => {
        setKeyword('')
        onSearch?.('')
    }

    const getItemKey = useCallback(
        (
            index: number,
            data: {
                dataSet: T[]
            },
        ) => {
            if (!itemKey) return index.toString()
            return data.dataSet[index][itemKey] as string
        },
        [itemKey],
    )

    const windowHeight = !!textFieldPropsRest.error && typeof height === 'number' ? height - 28 : height

    return (
        <div className={cx(classes.container, props.className)}>
            {!disableSearch && (
                <Box className={classes.searchInput}>
                    <MaskTextField
                        value={keyword}
                        placeholder="Search"
                        autoFocus
                        fullWidth
                        InputProps={{
                            style: { height: 40 },
                            inputProps: { style: { paddingLeft: 4 } },
                            startAdornment: <Icons.Search size={18} />,
                            endAdornment:
                                keyword ?
                                    <Icons.Close
                                        size={18}
                                        onClick={handleClear}
                                        color={textFieldPropsRest.error ? theme.palette.maskColor.danger : undefined}
                                    />
                                :   null,
                            ...InputProps,
                        }}
                        onChange={handleChange}
                        {...textFieldPropsRest}
                    />
                    {textFieldPropsRest.error ?
                        <Typography className={classes.error} mt={0.5}>
                            {textFieldPropsRest.helperText}
                        </Typography>
                    :   null}
                </Box>
            )}
            {loading ?
                <Stack
                    height={windowHeight}
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                    alignContent="center"
                    marginTop="18px"
                    marginBottom="48px">
                    <LoadingBase />
                </Stack>
            : readyToRenderData.length === 0 ?
                <Stack
                    height={windowHeight}
                    justifyContent="center"
                    alignContent="center"
                    marginTop="18px"
                    marginBottom="48px">
                    <EmptyResult />
                </Stack>
            :   <div className={classes.listBox}>
                    <FixedSizeList
                        className={classes.list}
                        width="100%"
                        height={windowHeight}
                        overscanCount={15}
                        itemSize={itemSize ?? 100}
                        itemData={{
                            dataSet: readyToRenderData,
                            onSelect,
                        }}
                        itemKey={getItemKey}
                        itemCount={readyToRenderData.length}
                        {...rest}>
                        {itemRender}
                    </FixedSizeList>
                </div>
            }
        </div>
    )
}

export interface MaskFixedSizeListProps extends FixedSizeListProps {}
