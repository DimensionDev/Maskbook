import { MaskTabList, makeStyles } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Box, Tab } from '@mui/material'
import { memo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useI18N } from '../../../../../utils/index.js'
import AddContactInputPanel from '../../../components/AddContactInputPanel/index.js'
import { NormalHeader } from '../../../components/index.js'
import { ContactsContext } from '../../../hook/useContactsContext.js'
import { useParamTab } from '../../../hook/useParamTab.js'
import { useTitle } from '../../../hook/useTitle.js'
import { FungibleTokenSection } from './FungibleTokenSection.js'
import { NonFungibleTokenSection } from './NonFungibleTokenSection.js'
import { TransferTabType } from '../type.js'

const useStyles = makeStyles()((theme) => ({
    page: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
    },
    body: {
        flexGrow: 1,
        // padding: theme.spacing(2, 2, 0),
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    panel: {
        '&:not([hidden])': {
            marginTop: theme.spacing(2),
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
        },
    },
    tabs: {
        flex: 'none!important',
        paddingTop: '0px!important',
        paddingLeft: 16,
        paddingRight: 16,
    },
}))

const Transfer = memo(function Transfer() {
    const { t } = useI18N()
    const { classes } = useStyles()

    useTitle(t('popups_send'))
    const [params] = useSearchParams()
    const paramRecipient = params.get('recipient')
    const isToken = !!params.get('token')

    const [currentTab, handleTabChange] = useParamTab<TransferTabType>(TransferTabType.Token)

    const { setReceiver } = ContactsContext.useContainer()

    useEffect(() => {
        setReceiver(paramRecipient || '')
    }, [paramRecipient])

    return (
        <Box className={classes.page}>
            <TabContext value={currentTab}>
                <NormalHeader
                    tabList={
                        isToken ? null : (
                            <MaskTabList
                                onChange={handleTabChange}
                                aria-label="persona-tabs"
                                classes={{ root: classes.tabs }}>
                                <Tab label={t('popups_wallet_token')} value={TransferTabType.Token} />
                                <Tab label={t('popups_wallet_collectible')} value={TransferTabType.NFT} />
                            </MaskTabList>
                        )
                    }
                />
                <div className={classes.body}>
                    <AddContactInputPanel p={0} m="16px 16px 0" />
                    <TabPanel value={TransferTabType.Token} className={classes.panel} data-hide-scrollbar>
                        <FungibleTokenSection />
                    </TabPanel>
                    <TabPanel value={TransferTabType.NFT} className={classes.panel} data-hide-scrollbar>
                        <NonFungibleTokenSection />
                    </TabPanel>
                </div>
            </TabContext>
        </Box>
    )
})

const TransferPage = memo(function TransferPage() {
    return (
        <ContactsContext.Provider>
            <Transfer />
        </ContactsContext.Provider>
    )
})

export default TransferPage
