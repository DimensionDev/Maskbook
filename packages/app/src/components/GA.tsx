import { useEffect } from 'react'

export function GA() {
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-HH3XSGH6WT'
        script.async = true
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
    }, [])

    useEffect(() => {
        const script = document.createElement('script')
        script.innerText = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-HH3XSGH6WT');
    `
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
    }, [])
    return null
}
