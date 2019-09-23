;(()=>{
  if (!browser) return
  if (browser.permissions) return
  browser.permissions = {}
  const requestedUrls = []
  browser.permissions.request = ({origins}) => {
    for (let i of origins) {
      if (requestedUrls.indexOf(i) === -1) requestedUrls.push(i)
    }
    return Promise.resolve(true)
  }
  browser.permissions.getAll = () => {
    return Promise.resolve({origins: requestedUrls})
  }
})()
