import * as backgroundService from '@masknet/background-service'
backgroundService.serviceSetup()
import './extension/service' // setup Services.*
import './social-network-adaptor' // setup social network providers
import './extension/background-script/Jobs' // start jobs
import './utils/debug/general'
