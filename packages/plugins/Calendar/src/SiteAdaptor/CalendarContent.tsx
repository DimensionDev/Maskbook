/* cspell: disable */
import React, { useState, useMemo } from 'react'
import { PluginID } from '@masknet/shared-base'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { DatePickerTab } from './components/DatePickerTab.js'
import { useEventList, useNFTList, useNewsList } from '../hooks/useEventList.js'
import { NewsList } from './components/NewsList.js'
import { EventList } from './components/EventList.js'
import { NFTList } from './components/NFTList.js'
import { Footer } from './components/Footer.js'
import { safeUnreachable } from '@masknet/kit'
import { useI18N } from '../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    calendar: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: '60px',
        position: 'relative',
    },
    hidden: {
        display: 'hidden',
    },
    tab: {
        fontSize: 16,
        fontWeight: 700,
    },
    tabList: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.80) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.20) 0%, rgba(69, 163, 251, 0.20) 100%), #FFF',
        padding: '8px 16px 0 16px',
        borderRadius: '12px 12px 0 0',
    },
    tabPanel: {
        padding: '0 4px 0 12px',
    },
}))

export function CalendarContent() {
    const { classes } = useStyles()
    const disable = useIsMinimalMode(PluginID.Calendar)
    const [currentTab, onChange, tabs] = useTabs('news', 'event', 'nfts')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const t = useI18N()
    const { data: eventList, isLoading: eventLoading } = useEventList(selectedDate)
    const { data: newsList, isLoading: newsLoading } = useNewsList(selectedDate)
    const { data: nftList, isLoading: nftLoading } = useNFTList(selectedDate)
    const list = useMemo(() => {
        switch (currentTab) {
            case 'news':
                return newsList
            case 'event':
                return eventList
            case 'nfts':
                return nftList
            default:
                safeUnreachable(currentTab)
                return null
        }
    }, [currentTab, newsList, eventList, nftList])
    console.log(list)
    const dateString = useMemo(() => selectedDate.toLocaleDateString(), [selectedDate])
    return (
        <div className={disable ? classes.hidden : classes.calendar}>
            <TabContext value={currentTab}>
                <div className={classes.tabList}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="">
                        <Tab className={classes.tab} label={t.news()} value={tabs.news} />
                        <Tab className={classes.tab} label={t.event()} value={tabs.event} />
                        <Tab className={classes.tab} label={t.nfts()} value={tabs.nfts} />
                    </MaskTabList>
                </div>
                <DatePickerTab
                    open={open}
                    setOpen={(open) => setOpen(open)}
                    selectedDate={selectedDate}
                    setSelectedDate={(date: Date) => setSelectedDate(date)}
                    list={list}
                />
                <TabPanel value={tabs.news} className={classes.tabPanel}>
                    <NewsList
                        list={newsList}
                        isLoading={newsLoading}
                        empty={!Object.keys(newsList).length}
                        dateString={dateString}
                    />
                </TabPanel>
                <TabPanel value={tabs.event} className={classes.tabPanel}>
                    <EventList
                        list={eventList}
                        isLoading={eventLoading}
                        empty={!Object.keys(eventList).length}
                        dateString={dateString}
                    />
                </TabPanel>
                <TabPanel value={tabs.nfts} className={classes.tabPanel}>
                    <NFTList
                        list={nftList}
                        isLoading={nftLoading}
                        empty={!Object.keys(newsList).length}
                        dateString={dateString}
                    />
                </TabPanel>
                <Footer provider={currentTab} />
            </TabContext>
        </div>
    )
}
