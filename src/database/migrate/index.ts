import avatar from './old.avatar.1'
import localKeys from './old.localKeys.1'
import keys from './old.keystore.1'

avatar()
    .finally(() => localKeys())
    .finally(() => keys())
