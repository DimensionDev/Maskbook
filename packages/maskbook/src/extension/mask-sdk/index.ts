import { createMaskSDKServer } from '@masknet/sdk'
import './hmr-sdk'
import { hmr_sdkServer } from './hmr-bridge'

const maskSDK = createMaskSDKServer(hmr_sdkServer)
