import { AsyncCall, MessageCenter } from '@holoflows/kit/es'
import { Background } from '../background-script/BackgroundService'
import { BackgroundName, CryptoName, FriendServiceName } from '../../utils/constants'
import { Encrypt } from '../background-script/CryptoService'
import { PeopleService as People } from '../background-script/PeopleService'

export const BackgroundService = AsyncCall<Background>({}, { key: BackgroundName })
export const CryptoService = AsyncCall<Encrypt>({}, { key: CryptoName })
export const PeopleService = AsyncCall<People>({}, { key: FriendServiceName })
