/* cspell: disable */
import React, { useState, useMemo } from 'react'
import { PluginID } from '@masknet/shared-base'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { DatePicker } from './components/DatePicker.js'
import { useEventList, useNFTList, useNewsList } from '../hooks/useEventList.js'
import { EventList } from './components/EventList.js'
import { NewsList } from './components/NewsList.js'
import { NFTList } from './components/NFTList.js'

const useStyles = makeStyles()((theme) => ({
    calendar: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: '60px',
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
}))

export function Calendar() {
    const { classes, cx } = useStyles()
    const disable = useIsMinimalMode(PluginID.Calendar)
    const [currentTab, onChange, tabs] = useTabs('news', 'event', 'nfts')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const { data: eventList, isLoading: eventLoading } = useEventList()
    const { data: newsList, isLoading: newsLoading } = useNewsList()
    const { data: nftList, isLoading: nftLoading } = useNFTList()
    const dateString = useMemo(() => selectedDate.toLocaleDateString(), [selectedDate])
    return (
        <div className={disable ? classes.hidden : classes.calendar}>
            <TabContext value={currentTab}>
                <div className={classes.tabList}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="">
                        <Tab className={classes.tab} label="News" value={tabs.news} />
                        <Tab className={classes.tab} label="Event" value={tabs.event} />
                        <Tab className={classes.tab} label="NFTs" value={tabs.nfts} />
                    </MaskTabList>
                </div>
                <DatePicker selectedDate={selectedDate} setSelectedDate={(date: Date) => setSelectedDate(date)} />
                <TabPanel value={tabs.news} style={{ padding: 0 }}>
                    <NewsList list={newsList[dateString]} />
                </TabPanel>
                <TabPanel value={tabs.event}>
                    <EventList list={eventList[dateString]} />
                </TabPanel>
                <TabPanel value={tabs.nfts}>
                    <NFTList list={nftList[dateString]} />
                </TabPanel>
            </TabContext>
        </div>
    )
}
