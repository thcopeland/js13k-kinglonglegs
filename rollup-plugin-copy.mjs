import fs from 'fs'

/**
 * A Rollup plugin to copy files around.
 */

export default function (files) {
    return {
        name: 'html',
        buildStart: function (options, bundle) {
            const names = Object.entries(files)
            for (const i in names) {
                const [src, dst] = names[i]
                this.addWatchFile(src)
                this.emitFile({
                    type: 'asset',
                    source: fs.readFileSync(src),
                    name: 'Final Output',
                    fileName: dst
                })
            }
        }
    }
}
