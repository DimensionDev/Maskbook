import { memo, useState } from 'react'
import { Balance } from './components/Balance'
import { ShapeContainer } from '../../components/ShapeContainer'
import { TabContext, TabPanel } from '@material-ui/lab'
import { Tab, Tabs, Box, Button, makeStyles } from '@material-ui/core'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { TokenTable } from './components/TokenTable'
import { useDashboardI18N } from '../../locales'

const useStyles = makeStyles((theme) => ({
    caption: {
        paddingRight: theme.spacing(2.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${MaskColorVar.lineLighter}`,
    },
    addCustomTokenButton: {
        borderRadius: Number(theme.shape.borderRadius) * 3.5,
        fontSize: theme.typography.caption.fontSize,
        lineHeight: theme.typography.pxToRem(16),
    },
    tab: {
        flex: 1,
    },
}))

export enum AssetTab {
    Token = 'Token',
    Investment = 'Investment',
    Collections = 'Collections',
}

const assetTabs = [AssetTab.Token, AssetTab.Investment, AssetTab.Collections] as const

type assetType = typeof assetTabs[number]

export const Market = memo(() => {
    const t = useDashboardI18N()
    const classes = useStyles()

    const assetTabsLabel: Record<assetType, string> = {
        [AssetTab.Token]: t.wallets_assets_token(),
        [AssetTab.Investment]: t.wallets_assets_investment(),
        [AssetTab.Collections]: t.wallets_assets_collections(),
    }

    const [activeTab, setActiveTab] = useState<assetType>(assetTabs[0])

    return (
        <>
            <Balance balance={0.1} onSend={() => {}} onBuy={() => {}} onSwap={() => {}} onReceive={() => {}} />
            <ShapeContainer sx={{ marginTop: 3, height: '80%', display: 'flex', flexDirection: 'column' }}>
                <TabContext value={activeTab}>
                    <Box className={classes.caption}>
                        <Tabs value={activeTab} onChange={(event, tab) => setActiveTab(tab)}>
                            {assetTabs.map((key) => (
                                <Tab key={key} value={key} label={assetTabsLabel[key]} sx={{ textTransform: 'none' }} />
                            ))}
                        </Tabs>
                        <Button color="secondary" className={classes.addCustomTokenButton}>
                            + {t.wallets_assets_custom_token()}
                        </Button>
                    </Box>
                    <TabPanel value={AssetTab.Token} key={AssetTab.Token} className={classes.tab}>
                        <TokenTable />
                    </TabPanel>
                </TabContext>
            </ShapeContainer>
        </>
    )
})
