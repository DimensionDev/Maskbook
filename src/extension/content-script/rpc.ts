import { AsyncCall, MessageCenter } from '@holoflows/kit/es'
import { Background } from '../background-script/BackgroundService'
import { BackgroundName, EncryptName } from '../../utils/Names'
import { Encrypt } from '../background-script/EncryptService'

export const BackgroundService = AsyncCall<Background, Background>(BackgroundName, {}, {}, MessageCenter, true)
export const EncryptService = AsyncCall<Encrypt, Encrypt>(EncryptName, {}, {}, MessageCenter, true)
