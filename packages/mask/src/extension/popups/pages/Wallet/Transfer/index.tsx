import { MaskTabList, makeStyles } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Box, Button, Tab } from '@mui/material'
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
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    page: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
    },
    body: {
        flexGrow: 1,
        padding: theme.spacing(2, 2, 0),
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
                    <AddContactInputPanel p={0} />
                    <TabPanel value={TransferTabType.Token} className={classes.panel} data-hide-scrollbar>
                        <FungibleTokenSection />
                    </TabPanel>
                    <TabPanel value={TransferTabType.NFT} className={classes.panel} data-hide-scrollbar>
                        <NonFungibleTokenSection />
                    </TabPanel>
                </div>
            </TabContext>
            {currentTab === TransferTabType.Token ? null : (
                <Box className={classes.actionGroup}>
                    <Button fullWidth>{t('confirm')}</Button>
                </Box>
            )}
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
