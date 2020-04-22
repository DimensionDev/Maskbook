import React, { useMemo, useState, Suspense, useRef, useTransition, useCallback } from 'react'
import DashboardRouterContainer from './Container'
import { TextField, IconButton, Typography } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import ClearIcon from '@material-ui/icons/Clear'
import SearchIcon from '@material-ui/icons/Search'
import { ContactLine, ContactLineSkeleton } from '../DashboardComponents/ContactLine'
import { useI18N } from '../../../utils/i18n-next-ui'
import { FixedSizeList } from 'react-window'
import AutoResize from 'react-virtualized-auto-sizer'
import { useSWRProfiles } from '../../../components/SuspenseDataSource/useSuspenseProfiles'
import type { Profile } from '../../../database'

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            margin: theme.spacing(3, 0),
        },
        progress: {
            width: '1.5em',
            height: '1.5em',
            marginRight: '0.75em',
        },
    }),
)

const contactLineFallback = (
    <>
        <ContactLineSkeleton />
        <ContactLineSkeleton />
        <ContactLineSkeleton />
        <ContactLineSkeleton />
    </>
)
export default function DashboardContactsRouter() {
    const { t } = useI18N()
    const classes = useStyles()
    const [searchUI, setSearchUI] = useState('')
    const [search, setSearch] = useState('')
    const [startTransition] = useTransition({ timeoutMs: 5000 })
    const actions = useMemo(
        () => [
            <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                value={searchUI}
                onChange={(e) => {
                    setSearchUI(e.target.value)
                    startTransition(() => setSearch(e.target.value))
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
        [search, searchUI, startTransition],
    )

    return (
        <DashboardRouterContainer title={t('contacts')} actions={actions}>
            <Typography className={classes.title} variant="body2" color="textSecondary">
                {t('people_in_database')}
            </Typography>
            {/* without flex: 1, the auto resize cannot resize to the max height it need. */}
            <section style={{ flex: 1 }}>
                <Suspense fallback={contactLineFallback}>
                    <ContactsList query={search === '' ? void 0 : search} />
                </Suspense>
            </section>
        </DashboardRouterContainer>
    )
}
function ContactsList(props: { query: string | undefined }) {
    const ref = useRef<FixedSizeList>(null)
    const { isEmpty, isLoadingMore, isReachingEnd, loadMore, pages, items } = useSWRProfiles(props.query)
    const [startTransition] = useTransition({ timeoutMs: 5000 })
    const isRealEmpty = isEmpty && items.length === 0
    return (
        <>
            <div style={{ display: 'none' }}>{pages}</div>
            {isRealEmpty ? 'TODO: No result' : ''}
            <AutoResize>
                {(size) => (
                    <FixedSizeList
                        ref={ref}
                        overscanCount={5}
                        onItemsRendered={(data) => {
                            if (!items[data.overscanStopIndex]) startTransition(loadMore)
                        }}
                        itemSize={64}
                        itemCount={items.length + (!isReachingEnd ? 1 : 0)}
                        {...size}>
                        {({ index, style }) =>
                            items[index] ? (
                                <ContactLine style={style} key={index} contact={items[index]}></ContactLine>
                            ) : (
                                <ContactLineSkeleton style={style} key={index} />
                            )
                        }
                    </FixedSizeList>
                )}
            </AutoResize>
        </>
    )
}
