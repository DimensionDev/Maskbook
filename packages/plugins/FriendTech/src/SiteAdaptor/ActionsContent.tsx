import { PluginWalletStatusBar } from '@masknet/shared'
import { useMatch } from 'react-router-dom'
import { RoutePaths } from '../constants.js'

export function MainActionsContent() {
    const matchMain = !!useMatch(RoutePaths.Main)

    return matchMain ? <PluginWalletStatusBar /> : null
}
