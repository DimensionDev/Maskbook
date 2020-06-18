import React, { useMemo, useState } from 'react'
import DashboardRouterContainer from './Container'
import { TextField, IconButton, Typography } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import ClearIcon from '@material-ui/icons/Clear'
import SearchIcon from '@material-ui/icons/Search'
import { useFriendsList } from '../../../components/DataSource/useActivatedUI'
import { ContactLine } from '../DashboardComponents/ContactLine'
import { useI18N } from '../../../utils/i18n-next-ui'
import { FixedSizeList } from 'react-window'
import AutoResize from 'react-virtualized-auto-sizer'

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            margin: theme.spacing(3, 0),
        },
    }),
)

export default function DashboardContactsRouter() {
    const { t } = useI18N()
    const classes = useStyles()

    // ? re-rendering this component seems too expensive, how to avoid?
    // TODO: debounce searching
    const [search, setSearch] = useState('')
    const actions = useMemo(
        () => [
            <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    endAdornment: (
                        <IconButton size="small" onClick={() => setSearch('')}>
                            {search ? <ClearIcon /> : <SearchIcon />}
                        </IconButton>
                    ),
                }}
            />,
        ],
        [search],
    )
    const contacts = useFriendsList().filter((i) =>
        search ? i.nickname?.includes(search) || i.identifier.toText().includes(search) : true,
    )

    return (
        <DashboardRouterContainer title={t('contacts')} actions={actions}>
            <Typography className={classes.title} variant="body2" color="textSecondary">
                {t('people_in_database')}
            </Typography>
            {/* without flex: 1, the auto resize cannot resize to the max height it need. */}
            <section style={{ flex: 1 }}>
                <AutoResize>
                    {(size) => (
                        <FixedSizeList {...size} itemSize={64} itemCount={contacts.length}>
                            {({ index, style }) => (
                                <ContactLine style={style} key={index} contact={contacts[index]}></ContactLine>
                            )}
                        </FixedSizeList>
                    )}
                </AutoResize>
            </section>
        </DashboardRouterContainer>
    )
}
