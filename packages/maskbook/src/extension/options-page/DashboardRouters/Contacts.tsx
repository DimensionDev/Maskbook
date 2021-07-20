import { useState, useCallback, useEffect } from 'react'
import DashboardRouterContainer from './Container'
import { TextField, IconButton, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ClearIcon from '@material-ui/icons/Clear'
import SearchIcon from '@material-ui/icons/Search'
import AutoResize from 'react-virtualized-auto-sizer'
import { useI18N } from '../../../utils'
import { ContactLine } from '../DashboardComponents/ContactLine'
import { FixedSizeList } from 'react-window'
import { useAsyncFn, useMap } from 'react-use'
import Services from '../../service'
import type { Profile } from '../../../database'
import { last } from 'lodash-es'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardContactSearchDialog } from '../DashboardDialogs/Contact'

const useStyles = makeStyles((theme) => ({
    title: {
        margin: theme.spacing(3, 0),
        color: theme.palette.text.secondary,
        [theme.breakpoints.down('sm')]: {
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
        [theme.breakpoints.down('sm')]: {
            marginLeft: theme.spacing(-2),
            marginRight: theme.spacing(-2),
        },
    },
}))

async function* queryProfilePaged(query: string | undefined, size = 20) {
    if (query === '') query = undefined
    const values: Profile[] = []
    while (true) {
        const current = await Services.Identity.queryProfilePaged({ query, after: last(values)?.identifier }, size)
        values.push(...current)
        if (current.length < size) break
        yield values
    }
    return values
}

// TODO: support concurrent mode
function createPaged<P extends any[], T>(
    fetcher: (...args: P) => AsyncGenerator<T[], T[], unknown>,
    hashArgs: (...args: P) => string,
) {
    type Records = readonly [
        generator: AsyncGenerator<T[], T[], unknown>,
        done: boolean,
        value: readonly T[],
        aborted: AbortController,
    ]
    return function usePaged(...InitArgs: P) {
        const [[query], setQuery] = useState([InitArgs])
        const key = hashArgs(...query)

        const [rec, { get, set, remove }] = useMap({} as Record<string, Records>)
        const [generator, done, value = [], abort] =
            get(key) ||
            (() => {
                const rec = [fetcher(...query), false, [], new AbortController()] as const
                set(key, rec)
                return rec
            })()

        const [{ loading }, nextPage] = useAsyncFn(async () => {
            if (done) return
            const result = await generator.next()
            if (abort.signal.aborted) return
            set(key, [generator, !!result.done, result.value, abort])
        }, [generator, done, abort])
        useEffect(() => void nextPage(), [nextPage])

        return {
            done,
            value,
            loading,
            nextPage,
            revalidate: useCallback(() => {
                remove(key)
                abort.abort()
            }, [abort, key, remove]),
            query,
            setQuery: useCallback((...args: P) => setQuery([args]), []),
        }
    }
}
const usePagedProfile = createPaged(queryProfilePaged, (x) => x || '')

export default function DashboardContactsRouter() {
    const {
        value: items,
        revalidate: mutate,
        loading: isPagePending,
        done: isReachingEnd,
        nextPage,
        query: [search],
        setQuery: setSearch,
    } = usePagedProfile('')

    const { t } = useI18N()
    const classes = useStyles()

    const isEmpty = !isPagePending && items.length === 0
    const [searchUI, setSearchUI] = useState('')
    const [searchContactDialog, , openSearchContactDialog] = useModal(DashboardContactSearchDialog)

    const actions = [
        <TextField
            placeholder={t('search')}
            size="small"
            value={searchUI}
            onChange={(e) => {
                setSearchUI(e.target.value)
                setSearch(e.target.value)
            }}
            InputProps={{
                endAdornment: (
                    <IconButton size="small" onClick={() => setSearch('')}>
                        {search ? <ClearIcon /> : <SearchIcon />}
                    </IconButton>
                ),
            }}
        />,
    ]

    return (
        <DashboardRouterContainer
            title={t('contacts')}
            empty={items.length === 0}
            actions={actions}
            floatingButtons={[
                {
                    icon: <SearchIcon />,
                    handler: () => openSearchContactDialog({ onSearch: setSearch }),
                },
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
                                if (isPagePending) return
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
                                        onUpdated={mutate}
                                        onDeleted={mutate}
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
