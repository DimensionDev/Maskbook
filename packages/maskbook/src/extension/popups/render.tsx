import { startPluginDashboard } from '@masknet/plugin-infra'
import { createNormalReactRoot } from '../../utils'
import { createPluginHost } from '../../../src/plugin-infra/host'
import { status } from '../../setup.ui'
import Popups from './UI'

status.then(() => createNormalReactRoot(<Popups />))

// TODO: Should only load plugins when the page is plugin-aware.
startPluginDashboard(createPluginHost(undefined, () => undefined))
