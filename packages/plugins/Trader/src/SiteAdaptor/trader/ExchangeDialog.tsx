import { t } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { makeStyles, MaskTabList } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { Box } from '@mui/system'
import { memo } from 'react'
import { matchPath, MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { RouterDialog } from '../components/RouterDialog.js'
import { RoutePaths } from '../constants.js'
import { ExchangeRoutes } from './Routes.js'
import { Providers, useSwap, type TradeMode } from './contexts/index.js'

const useStyles = makeStyles()((theme) => ({
    icons: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    icon: {
        width: 24,
        height: 24,
        cursor: 'pointer',
    },
    dialog: {
        padding: theme.spacing(3, 2),
        scrollbarColor: 'initial',
    },
    dialogPaper: {
        width: 600,
        height: 620,
    },
    content: {
        padding: 0,
        overflow: 'auto',
        boxSizing: 'border-box',
        scrollbarWith: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))
export interface ExchangeDialogProps {
    onClose: () => void
    toAddress?: string
    toChainId?: number
}

export const Dialog = memo<ExchangeDialogProps>(function Dialog({ onClose }) {
    const { classes } = useStyles()

    const { pathname } = useLocation()
    const match = matchPath(RoutePaths.Trade, pathname)
    const navigate = useNavigate()
    const { mode, setMode } = useSwap()

    const titleMap: Record<RoutePaths, string | null> = {
        [RoutePaths.Trade]: t`Exchange`,
        [RoutePaths.History]: t`History`,
        [RoutePaths.Confirm]: t`Confirm Swap`,
        [RoutePaths.BridgeConfirm]: t`Confirm Bridge`,
        [RoutePaths.SelectLiquidity]: t`Select Liquidity`,
        [RoutePaths.Slippage]: t`Slippage`,
        [RoutePaths.QuoteRoute]: t`Quote Route`,
        [RoutePaths.BridgeQuoteRoute]: t`Quote Route`,
        [RoutePaths.TradingRoute]: t`Trading Route`,
        [RoutePaths.Exit]: null,
        [RoutePaths.NetworkFee]: t`Network fee`,
        [RoutePaths.Transaction]: t`Transaction Details`,
    }
    const title = titleMap[pathname as RoutePaths] ?? t`Exchange`

    return (
        <RouterDialog
            open
            onClose={onClose}
            className={classes.dialog}
            title={title}
            classes={{
                paper: classes.dialogPaper,
            }}
            sx={{ p: 3 }}
            titleTail={
                match ?
                    <Box className={classes.icons}>
                        <Icons.History
                            size={24}
                            className={classes.icon}
                            onClick={() => {
                                navigate(RoutePaths.History)
                            }}
                        />
                    </Box>
                :   null
            }
            titleTabs={
                match ?
                    <TabContext value={mode}>
                        <MaskTabList
                            variant="base"
                            onChange={(_, tab) => {
                                setMode(tab as TradeMode)
                            }}>
                            <Tab label={t`Swap`} value="swap" />
                            <Tab label={t`Bridge`} value="bridge" />
                        </MaskTabList>
                    </TabContext>
                :   null
            }>
            <DialogContent className={classes.content}>
                <ExchangeRoutes />
            </DialogContent>
        </RouterDialog>
    )
})

const initialEntries = [RoutePaths.Exit, RoutePaths.Trade]
export const ExchangeDialog = memo<ExchangeDialogProps>(function ExchangeDialog(props) {
    return (
        <MemoryRouter initialEntries={initialEntries} initialIndex={1}>
            <Providers>
                <Dialog {...props} />
            </Providers>
        </MemoryRouter>
    )
})
