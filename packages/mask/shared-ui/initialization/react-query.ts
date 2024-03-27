import { setInitData } from '../utils/persistOptions.js'

browser.storage.local.get('react-query').then(({ 'react-query': data }) => {
    setInitData('react-query', data)
})
