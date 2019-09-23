;(()=>{
  if (typeof browser === 'undefined' || !browser) return
  if (browser.permissions) return
  browser.permissions = {}
  const item = localStorage.getItem('requestedUrls')
  const requestedUrls = JSON.parse(item) || []
  browser.permissions.request = ({origins}) => {
    for (let i of origins) {
      if (!requestedUrls.includes(i)) requestedUrls.push(i)
    }
    localStorage.setItem('requestedUrls', JSON.stringify(requestedUrls))
    return Promise.resolve(true)
  }
  browser.permissions.getAll = () => {
    return Promise.resolve({origins: requestedUrls})
  }
})()
