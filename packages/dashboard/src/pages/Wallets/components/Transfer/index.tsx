import { memo, useState } from 'react'
import { ShapeContainer } from '../../../../components/ShapeContainer'
import { TabContext } from '@material-ui/lab'
import { makeStyles, Box, Tabs, Tab } from '@material-ui/core'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'

const useStyles = makeStyles((theme) => ({
    caption: {
        paddingRight: theme.spacing(2.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${MaskColorVar.lineLighter}`,
    },
}))

export enum AssetType {
    Token = 'Token',
}

const assetTypeTabs = [AssetType.Token] as const

export const Transfer = memo(() => {
    const classes = useStyles()

    const assetTypeLabel: Record<AssetType, string> = {
        [AssetType.Token]: 'Token',
    }

    const [activeTab, setActiveTab] = useState<AssetType>(assetTypeTabs[0])

    return (
        <ShapeContainer sx={{ marginTop: 3, height: '80%', display: 'flex', flexDirection: 'column' }}>
            <TabContext value={activeTab}>
                <Box className={classes.caption}>
                    <Tabs value={activeTab} onChange={(event, tab) => setActiveTab(tab)}>
                        {assetTypeTabs.map((key) => (
                            <Tab key={key} value={key} label={assetTypeLabel[key]} sx={{ textTransform: 'none' }} />
                        ))}
                    </Tabs>
                </Box>
            </TabContext>
        </ShapeContainer>
    )
})
