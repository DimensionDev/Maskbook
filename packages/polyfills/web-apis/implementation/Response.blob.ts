try {
    // See: https://bugs.chromium.org/p/chromium/issues/detail?id=1355770
    Response.prototype.blob = async function (this: Response) {
        return new Blob([await this.arrayBuffer()], {
            type: this.headers.get('Content-Type')?.split(';')[0],
        })
    }
} catch {}
