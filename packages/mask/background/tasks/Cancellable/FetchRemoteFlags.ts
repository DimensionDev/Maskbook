import { startFetchRemoteFlag } from '@masknet/flags'
import { extensionRemoteFlagIO } from '../../../shared/helpers/remoteFlagIO.js'
import { hmr } from '../../../utils-pure/index.js'

const { signal } = hmr(import.meta.webpackHot)

startFetchRemoteFlag(extensionRemoteFlagIO, signal)
