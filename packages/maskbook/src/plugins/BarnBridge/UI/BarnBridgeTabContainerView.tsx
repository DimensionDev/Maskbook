import { DarkColor } from '@masknet/theme/constants'
import {
    Card,
    CardActions,
    CardContent,
    Link,
    Paper,
    Tab,
    Tabs,
    Typography,
    Tooltip,
    Button,
    Container,
} from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import React, { useState } from 'react'
import { MaskbookTextIcon } from '../../../resources/MaskbookIcon'
import {
    BarnBridgeYieldFarmingIcon,
    BarnBridgeSmartYieldIcon,
    BarnBridgeSmartAlphaIcon,
    BarnBridgeLogo,
} from '../BarnBridgeIcon'
import { useI18N } from '../../../utils/i18n-next-ui'
import {
    COLOR_BARNBRIDGE_ORANGE,
    COLOR_BARNBRIDGE_BACKGROUND_CARD_DARK,
    COLOR_BARNBRIDGE_BACKGROUND_CARD_LIGHT,
    COLOR_BARNBRIDGE_BACKGROUND_DARK,
    COLOR_BARNBRIDGE_BACKGROUND_LIGHT,
} from '../constants'
import { SmartYieldPoolsView } from './SmartYieldPoolsView'
import { YieldFarmingView } from './YieldFarmingView'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
        backgroundColor:
            theme.palette.mode === 'dark'
                ? COLOR_BARNBRIDGE_BACKGROUND_CARD_DARK
                : COLOR_BARNBRIDGE_BACKGROUND_CARD_LIGHT,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        height: 'var(--contentHeight)',
        display: 'flex',
        paddingTop: 100,
        flexDirection: 'row',
        padding: '0 !important',
    },
    body: {
        flex: 8,
        overflow: 'auto',
        alignContent: 'centered',
        maxHeight: 350,
        borderRadius: 0,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        backgroundColor:
            theme.palette.mode === 'dark' ? COLOR_BARNBRIDGE_BACKGROUND_DARK : COLOR_BARNBRIDGE_BACKGROUND_LIGHT,
    },
    tabs: {
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        flex: 1,
        color: COLOR_BARNBRIDGE_ORANGE,
    },
    tab: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'centered',
        flexGrow: 1,
    },
    footer: {
        marginTop: -1,
        zIndex: 1,
        flexDirection: 'row',
        position: 'relative',
        borderTop: `solid 1px ${theme.palette.divider}`,
        justifyContent: 'space-between',
    },
    footnote: {
        fontSize: 10,
        flexDirection: 'column',
        alignContent: 'centered',
        marginRight: theme.spacing(1),
    },
    footLink: {
        cursor: 'pointer',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
    },
    footMenu: {
        color: theme.palette.text.secondary,
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
    },
    footName: {
        marginLeft: theme.spacing(0.5),
    },
    maskbook: {
        width: 40,
        height: 10,
    },
    tabIcons: {
        display: 'flex',
        paddingRight: 100,
        flexGrow: 1,
        alignContent: 'center',
    },
    barnBridgeLogo: {
        display: 'flex',
        paddingRight: 5,
        flex: 1,
        alignItems: 'center',
        alignSelf: 'center',
    },
    barnBridgeFooterContainer: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row-reverse',
        alignSelf: 'center',
    },
}))

interface PoolTogetherViewProps {}

export function BarnBridgeTabContainerView(props: PoolTogetherViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    //#region tabs

    // Tooltips
    const syTooltipTextbox = <Button variant="contained">{t('plugin_barnbridge_tab_sy')}</Button>
    const yfTooltipTextbox = <Button variant="contained">{t('plugin_barnbridge_tab_yield_farming')}</Button>
    const saTooltipTextbox = <Button variant="contained">{t('plugin_barnbridge_tab_smart_alpha')}</Button>

    // Tabs Construction
    const SmartYieldTab = (props: PoolTogetherViewProps) => (
        <Tooltip title={syTooltipTextbox} placement="right" arrow>
            <div>
                <Tab {...props} key="SY" icon={<BarnBridgeSmartYieldIcon classes={{ root: classes.tabIcons }} />} />
            </div>
        </Tooltip>
    )
    const YieldFarmingTab = (props: PoolTogetherViewProps) => (
        <Tooltip title={yfTooltipTextbox} placement="right" arrow>
            <div>
                <Tab
                    {...props}
                    key="YieldFarming"
                    disabled
                    icon={<BarnBridgeYieldFarmingIcon classes={{ root: classes.tabIcons }} />}
                />
            </div>
        </Tooltip>
    )
    const SmartAlphaTab = (props: PoolTogetherViewProps) => (
        <Tooltip title={saTooltipTextbox} placement="right" arrow>
            <div>
                <Tab
                    {...props}
                    key="SA"
                    disabled
                    icon={<BarnBridgeSmartAlphaIcon classes={{ root: classes.tabIcons }} />}
                />
            </div>
        </Tooltip>
    )

    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [<SmartYieldTab />, <YieldFarmingTab />, <SmartAlphaTab />]
    //#endregion

    return (
        <Card className={classes.root} elevation={0}>
            <CardContent className={classes.content}>
                <Tabs
                    className={classes.tabs}
                    indicatorColor="primary"
                    textColor="inherit"
                    variant="fullWidth"
                    value={tabIndex}
                    orientation="vertical"
                    onChange={(ev: React.ChangeEvent<{}>, newValue: number) => {
                        setTabIndex(newValue)
                    }}
                    TabIndicatorProps={{
                        style: {
                            display: 'none',
                        },
                    }}>
                    {tabs}
                </Tabs>
                <Paper className={classes.body}>
                    {tabIndex === 0 ? <SmartYieldPoolsView /> : null}
                    {tabIndex === 1 ? <YieldFarmingView /> : null}
                    {tabIndex === 2 ? 'Smart Alpha' : null}
                </Paper>
            </CardContent>
            <CardActions className={classes.footer}>
                <Typography color={DarkColor.textSecondary} className={classes.footnote} variant="subtitle2">
                    <span>{t('plugin_powered_by')} </span>
                    <Link
                        className={classes.footLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Mask"
                        href="https://mask.io">
                        <MaskbookTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 80 20" />
                    </Link>
                </Typography>
                <Typography className={classes.footnote} color={DarkColor.textSecondary} variant="subtitle2">
                    <Link
                        className={classes.footLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="BarnBridge"
                        href="https://barnbridge.com/">
                        <Container className={classes.barnBridgeFooterContainer}>
                            BarnBridge
                            <BarnBridgeLogo classes={{ root: classes.barnBridgeLogo }} />
                        </Container>
                    </Link>
                </Typography>
            </CardActions>
        </Card>
    )
}
