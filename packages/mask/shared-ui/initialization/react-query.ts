import { queryClient } from '@masknet/shared-base-ui'
import { broadcastQueryClient } from '../utils/broadcastQueryClient.js'
import { setInitData } from '../utils/persistOptions.js'

broadcastQueryClient({ queryClient })

browser.storage.local.get('react-query').then(({ 'react-query': data }) => {
    setInitData('react-query', data)
})
