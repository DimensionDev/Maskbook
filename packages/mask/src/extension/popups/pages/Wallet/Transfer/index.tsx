import { MaskTabList, makeStyles } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Box, Button, Tab } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../../../utils/index.js'
import AddContactInputPanel from '../../../components/AddContactInputPanel/index.js'
import { NormalHeader } from '../../../components/index.js'
import { ContactsContext } from '../../../hook/useContactsContext.js'
import { useParamTab } from '../../../hook/useParamTab.js'
import { useTitle } from '../../../hook/useTitle.js'
import { FungibleTokenSection } from './FungibleTokenSection.js'

const useStyles = makeStyles()((theme) => ({
    page: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
    },
    body: {
        flexGrow: 1,
        padding: theme.spacing(2),
        overflow: 'auto',
    },
    panel: {
        padding: 0,
    },
    tabs: {
        flex: 'none!important',
        paddingTop: '0px!important',
        paddingLeft: 16,
        paddingRight: 16,
    },
    actionGroup: {
        display: 'flex',
        justifyContent: 'center',
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
        width: '100%',
        bottom: 0,
        zIndex: 100,
        marginTop: 'auto',
    },
}))

enum TabType {
    Token = 'Token',
    NFT = 'NFT',
}

const Transfer = memo(function Transfer() {
    // const location = useLocation()
    const { t } = useI18N()
    const { classes } = useStyles()

    useTitle(t('popups_send'))

    const [currentTab, handleTabChange] = useParamTab<TabType>(TabType.Token)

    // useEffect(() => {
    //     const address = new URLSearchParams(location.search).get('selectedToken')
    //     if (!address) return
    //     const target = assets.find((x) => isSameAddress(x.address, address))
    //     setSelectedAsset(target)
    // }, [assets, location])

    return (
        <Box className={classes.page}>
            <TabContext value={currentTab}>
                <NormalHeader
                    tabList={
                        <MaskTabList
                            onChange={handleTabChange}
                            aria-label="persona-tabs"
                            classes={{ root: classes.tabs }}>
                            <Tab label={t('popups_wallet_token')} value={TabType.Token} />
                            <Tab label={t('popups_wallet_collectible')} value={TabType.NFT} />
                        </MaskTabList>
                    }
                />
                <div className={classes.body}>
                    <ContactsContext.Provider>
                        <AddContactInputPanel />
                    </ContactsContext.Provider>
                    <TabPanel value={TabType.Token} className={classes.panel}>
                        <FungibleTokenSection />
                    </TabPanel>
                    <TabPanel value={TabType.NFT} className={classes.panel}>
                        <div>nft</div>
                    </TabPanel>
                </div>
            </TabContext>
            {currentTab === TabType.Token ? (
                <Box className={classes.actionGroup}>
                    <Button variant="outlined" fullWidth>
                        {t('next')}
                    </Button>
                    <Button fullWidth>{t('next')}</Button>
                </Box>
            ) : (
                <Box className={classes.actionGroup}>
                    <Button fullWidth>{t('confirm')}</Button>
                </Box>
            )}
        </Box>
    )
})

export default Transfer
