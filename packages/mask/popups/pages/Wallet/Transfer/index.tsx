import { useParamTab } from '@masknet/shared'
import { MaskTabList, makeStyles } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Box, Tab } from '@mui/material'
import { memo, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import AddContactInputPanel from '../../../components/AddContactInputPanel/index.js'
import { NormalHeader } from '../../../components/index.js'
import { ContactsContext, useNonFungibleTokenParams, useTitle, useTokenParams } from '../../../hooks/index.js'
import { TransferTabType } from '../type.js'
import { FungibleTokenSection } from './FungibleTokenSection.js'
import { NonFungibleTokenSection } from './NonFungibleTokenSection.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    const { _ } = useLingui()
    const { classes } = useStyles()

    useTitle(_(msg`Send`))
    const [params, setParams] = useSearchParams()
    const undecided = params.get('undecided') === 'true'

    const [currentTab, handleTabChange] = useParamTab<TransferTabType>(TransferTabType.Token)

    const { address } = ContactsContext.useContainer()
    useEffect(() => {
        setParams(
            (p) => {
                p.set('recipient', address)
                return p.toString()
            },
            { replace: true },
        )
    }, [address, setParams])

    return (
        <Box className={classes.page}>
            <TabContext value={currentTab}>
                <NormalHeader
                    tabList={
                        undecided ?
                            <MaskTabList
                                onChange={handleTabChange}
                                aria-label="persona-tabs"
                                classes={{ root: classes.tabs }}>
                                <Tab label={<Trans>Tokens</Trans>} value={TransferTabType.Token} />
                                <Tab label={<Trans>NFTs</Trans>} value={TransferTabType.NFT} />
                            </MaskTabList>
                        :   null
                    }
                />
                <div className={classes.body}>
                    <AddContactInputPanel p={0} m="16px 16px 0" autoFocus />
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

export const Component = memo(function TransferPage() {
    const [params] = useSearchParams()
    const defaultAddress = params.get('recipient') || ''
    const defaultName = params.get('recipientName') || ''
    const { chainId } = useTokenParams()
    const { chainId: nftChainId } = useNonFungibleTokenParams()
    const tab = params.get('tab')
    const rawPendingChainId = params.get('pendingChainId')
    const pendingChainId = rawPendingChainId ? Number.parseInt(rawPendingChainId, 10) : undefined
    const defaultChainId = pendingChainId ?? (tab === TransferTabType.Token ? chainId : nftChainId)

    const initialState = useMemo(
        () => ({ defaultAddress, defaultName, defaultChainId }),
        [defaultAddress, defaultName, defaultChainId],
    )
    return (
        <ContactsContext initialState={initialState}>
            <Transfer />
        </ContactsContext>
    )
})
