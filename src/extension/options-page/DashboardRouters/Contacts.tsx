import React, { useMemo, useState, unstable_useTransition, useCallback } from 'react'
import DashboardRouterContainer from './Container'
import { TextField, IconButton, Typography } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import ClearIcon from '@material-ui/icons/Clear'
import SearchIcon from '@material-ui/icons/Search'
import AutoResize from 'react-virtualized-auto-sizer'
import { ContactLine } from '../DashboardComponents/ContactLine'
import { useI18N } from '../../../utils/i18n-next-ui'
import { FixedSizeList } from 'react-window'
import { useSWRInfinite } from 'swr'
import Services from '../../service'
import type { Profile } from '../../../database'
import { last } from 'lodash-es'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardContactSearchDialog } from '../DashboardDialogs/Contact'

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            margin: theme.spacing(3, 0),
            color: theme.palette.text.secondary,
            [theme.breakpoints.down('xs')]: {
                margin: theme.spacing(2, 0),
            },
        },
        progress: {
            width: '1.5em',
            height: '1.5em',
            marginRight: '0.75em',
        },
        list: {
            flex: 1,
            [theme.breakpoints.down('xs')]: {
                marginLeft: theme.spacing(-2),
                marginRight: theme.spacing(-2),
            },
        },
    }),
)

const fetcher = (key: number, size: number, search: string, offset?: Profile) =>
    Services.Identity.queryProfilePaged(
        {
            // undefined will fetch the first page
            query: search ? search : void 0,
            after: offset?.identifier,
        },
        20,
    )

export default function DashboardContactsRouter() {
    const { t } = useI18N()
    const classes = useStyles()

    const [search, setSearch] = useState('')
    const [searchUI, setSearchUI] = useState('')
    const [startSearchTransition, isSearchPending] = unstable_useTransition({ timeoutMs: 5000 })
    const [searchContactDialog, , openSearchContactDialog] = useModal(DashboardContactSearchDialog)

    const actions = useMemo(
        () => [
            <TextField
                placeholder={t('search')}
                variant="outlined"
                size="small"
                value={searchUI}
                onChange={(e) => {
                    setSearchUI(e.target.value)
                    startSearchTransition(() => setSearch(e.target.value))
                }}
                InputProps={{
                    endAdornment: (
                        <IconButton size="small" onClick={() => setSearch('')}>
                            {search ? <ClearIcon /> : <SearchIcon />}
                        </IconButton>
                    ),
                }}
            />,
        ],
        [search, searchUI, startSearchTransition],
    )
    const swr = useSWRInfinite<Profile[]>(
        (size, previosuPageData) => [
            search ? `profile:${search}:${size}` : `profile:${size}`,
            size,
            search || undefined, // undefined means fetch from start
            last(previosuPageData),
        ],
        fetcher,
    )

    const { data, size, setSize, revalidate } = swr
    const isEmpty = data?.[0]?.length === 0
    const isReachingEnd = data && data[data.length - 1]?.length < 20
    const items = data ? ([] as Profile[]).concat(...data) : []

    const [startPageTransition, isPagePending] = unstable_useTransition({ timeoutMs: 1e5 })
    const nextPage = useCallback(
        () =>
            startPageTransition(() => {
                setSize?.(size ? size + 1 : 0)
            }),
        [size, setSize],
    )

    return (
        <DashboardRouterContainer
            title={t('contacts')}
            empty={items.length === 0}
            actions={actions}
            rightIcons={[
                <IconButton onClick={() => openSearchContactDialog({ onSearch: setSearch })}>
                    <SearchIcon />
                </IconButton>,
            ]}>
            <Typography className={classes.title} variant="body2">
                {t('people_in_database')}
            </Typography>
            <section className={classes.list}>
                <AutoResize>
                    {(sizeProps) => (
                        <FixedSizeList
                            overscanCount={5}
                            onItemsRendered={(data) => {
                                if (isEmpty || isReachingEnd) return
                                if (isPagePending || isSearchPending) return
                                if (data.visibleStopIndex === data.overscanStopIndex) nextPage()
                            }}
                            itemSize={64}
                            itemCount={items.length}
                            {...sizeProps}>
                            {({ index, style }) =>
                                items[index] ? (
                                    <ContactLine
                                        style={style as any}
                                        key={index}
                                        contact={items[index]}
                                        onUpdated={revalidate}
                                        onDeleted={revalidate}
                                    />
                                ) : null
                            }
                        </FixedSizeList>
                    )}
                </AutoResize>
            </section>
            {searchContactDialog}
        </DashboardRouterContainer>
    )
}
