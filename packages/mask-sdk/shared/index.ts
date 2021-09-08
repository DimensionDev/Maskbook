export interface BridgeAPI {
    persona_sign_web3(message: string): Promise<string>
}
export interface UserScriptAPI {}
export { serializer } from './serializer'
export { createMaskSDKChannel } from './channel'
