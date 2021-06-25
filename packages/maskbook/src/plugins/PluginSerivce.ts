/**
 * Important notes on HMR for plugin services
 *
 * createPluginMessage and createPluginRPC supports HMR out of the box.
 * So if you only use these two things, please add the following code to enable HMR.
 *
 * if (import.meta.webpackHot) import.meta.webpackHot.accept()
 */

// Please make sure you have registered your plugin UI at ./PluginUI
import './Wallet/messages'
import './RedPacket/messages'
import './Gitcoin/messages'
import './FileService/utils'
import './Polls/messages'
import './Transak/messages'
import './Trader/messages'
import './Polls/messages'
import './ITO/messages'
import './Airdrop/messages'
import './dHEDGE/messages'
