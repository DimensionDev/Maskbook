import { PLUGIN_ID } from './constants.js'
import { createPluginMessage } from '@masknet/plugin-infra'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const NFTAvatarMessage = createPluginMessage(PLUGIN_ID)
