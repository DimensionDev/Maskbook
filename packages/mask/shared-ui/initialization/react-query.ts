import Services from '#services'
import { setInitData } from '../utils/persistOptions.js'

if (typeof browser === 'object') {
    browser.storage.local.get('react-query').then(({ 'react-query': data }) => {
        setInitData('react-query', data)
    })
} else {
    Services.Helper.getReactQueryCache().then((data) => setInitData('react-query', data))
}
