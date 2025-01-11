import { Trans } from '@lingui/react/macro'
import { EMPTY_LIST } from '@masknet/shared-base'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { EventProvider } from '@masknet/web3-providers/types'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab } from '@mui/material'
import { useState, type HTMLProps } from 'react'
import { useAvailableDates } from '../hooks/useAvailableDates.js'
import { DatePickerTab } from './components/DatePickerTab.js'
import { EventList } from './components/EventList.js'
import { Footer } from './components/Footer.js'
import { NewsList } from './components/NewsList.js'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        calendar: {
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.maskColor.line}`,
            position: 'relative',
            marginBottom: '20px',
        },
        tab: {
            fontSize: 16,
            fontWeight: 700,
        },
        tabList: {
            background:
                isDark ?
                    'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.06) 100%)'
                :   'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.80) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.20) 0%, rgba(69, 163, 251, 0.20) 100%), #FFF',
            padding: '8px 16px 0 16px',
            borderRadius: '12px 12px 0 0',
        },
        tabPanel: {
            padding: '0 4px 0 12px',
        },
    }
})

interface Props extends HTMLProps<HTMLDivElement> {
    target?: string
}

export function CalendarContent(props: Props) {
    const { classes, cx } = useStyles()
    const [currentTab, onChange, tabs] = useTabs('news', 'events')
    const [date, setDate] = useState(() => new Date(Math.floor(Date.now() / 1000) * 1000)) // round to seconds
    const [pickerDate, setPickerDate] = useState(date)
    const [open, setOpen] = useState(false)

    const isNews = currentTab === tabs.news
    const { data: allowedDates = EMPTY_LIST } = useAvailableDates(
        isNews ? EventProvider.CoinCarp : EventProvider.Luma,
        pickerDate,
    )

    return (
        <div {...props} className={cx(classes.calendar, props.className)}>
            <TabContext value={currentTab}>
                <div className={classes.tabList}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="">
                        <Tab className={classes.tab} label={<Trans>News</Trans>} value={tabs.news} />
                        <Tab className={classes.tab} label={<Trans>Events</Trans>} value={tabs.events} />
                    </MaskTabList>
                </div>
                <DatePickerTab
                    open={open}
                    onToggle={setOpen}
                    date={date}
                    onChange={setDate}
                    allowedDates={allowedDates}
                    onMonthChange={setPickerDate}
                />
                <TabPanel value={tabs.news} className={classes.tabPanel}>
                    <NewsList date={date} />
                </TabPanel>
                <TabPanel value={tabs.events} className={classes.tabPanel}>
                    <EventList date={date} />
                </TabPanel>
                <Footer tab={currentTab} />
            </TabContext>
        </div>
    )
}
