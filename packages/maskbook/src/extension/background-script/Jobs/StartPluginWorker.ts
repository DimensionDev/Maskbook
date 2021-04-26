import { startPluginWorker } from '@dimensiondev/mask-plugin-infra/src'
import { ethStatusReporter } from '../../../settings/settings'

startPluginWorker(ethStatusReporter)
