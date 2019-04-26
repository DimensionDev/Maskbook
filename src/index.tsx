Object.assign(window, { browser: require('webextension-polyfill') })
import React from 'react'
import ReactDOM from 'react-dom'

Array.from(document.querySelectorAll('script'))
    .filter(x => x.src.match(/content|inject|service|hot/))
    .forEach(x => x.remove())
// import Comp from './components/Dashboard/Dashboard'

// ReactDOM.render(
//     <Comp identities={[]} addAccount={() => {}} exportBackup={() => {}} onProfileClick={() => {}} />,
//     document.querySelector('#root'),
// )
