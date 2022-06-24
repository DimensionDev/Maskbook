import type { FC } from 'react'
import { useCurrentWeb3NetworkPluginID, useNativeTokenAddress, Web3Helper } from '@masknet/plugin-infra/web3'
import { FungibleTokenList, useSharedI18N } from '@masknet/shared'
import { EMPTY_LIST, EnhanceableSite, isDashboardPage } from '@masknet/shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { DialogContent, Theme, useMediaQuery } from '@mui/material'
import { useBaseUIRuntime } from '../base'
import { InjectedDialog } from '../components'
import { useRowSize } from './useRowSize'
import { SettingsBoard } from '../../UI/components/SettingsBoard'

interface StyleProps {
    compact: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { compact }) => ({
    content: {
        ...(compact ? { minWidth: 552 } : {}),
        padding: theme.spacing(3),
        paddingTop: 0,
    },
    list: {
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    placeholder: {
        textAlign: 'center',
        height: 288,
        paddingTop: theme.spacing(14),
        boxSizing: 'border-box',
    },
    search: {
        backgroundColor: 'transparent !important',
        border: `solid 1px ${MaskColorVar.twitterBorderLine}`,
    },
}))

export interface SelectGasSettingsDialogProps<T extends NetworkPluginID = NetworkPluginID> {
    open: boolean
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    keyword?: string
    whitelist?: string[]
    title?: string
    blacklist?: string[]
    tokens?: Array<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    disableSearchBar?: boolean
    disableNativeToken?: boolean
    selectedTokens?: string[]
    onSubmit?(token: Web3Helper.FungibleTokenScope<'all'> | null): void
    onClose?(): void
}

const isDashboard = isDashboardPage()
export const SelectGasSettingsDialog: FC<SelectGasSettingsDialogProps> = ({
    open,
    pluginID,
    chainId,
    disableSearchBar,
    disableNativeToken,
    tokens,
    whitelist,
    blacklist = EMPTY_LIST,
    selectedTokens = EMPTY_LIST,
    onSubmit,
    onClose,
    title,
}) => {
    const t = useSharedI18N()
    const { networkIdentifier } = useBaseUIRuntime()
    const compact = networkIdentifier === EnhanceableSite.Minds
    const pluginId = useCurrentWeb3NetworkPluginID(pluginID)
    const { classes } = useStyles({ compact })
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))

    const rowSize = useRowSize()

    const nativeTokenAddress = useNativeTokenAddress(pluginId)

    return (
        <InjectedDialog
            titleBarIconStyle={isDashboard ? 'close' : 'back'}
            open={open}
            onClose={onClose}
            title={title ?? t.gas_settings_title()}>
            <DialogContent classes={{ root: classes.content }}>
                <SettingsBoard />
            </DialogContent>
        </InjectedDialog>
    )
}
