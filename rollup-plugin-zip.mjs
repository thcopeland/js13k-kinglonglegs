import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

/**
 * A Rollup plugin to zip stuff.
 */

export default function ({ file }) {
    return {
        name: 'zip',
        writeBundle: function (_, bundle) {
            let originalSize = 0

            for (const srcFile in bundle) {
                const data = bundle[srcFile]
                if (data.type === 'asset') {
                    const fullPath = path.join(path.dirname(file), srcFile)
                    execSync(`/usr/bin/zip ${file} -9 -j ${fullPath}`)
                    originalSize += fs.statSync(fullPath).size
                }
            }

            const zippedSizeKb = Math.round(fs.statSync(file).size / 1024 * 100) / 100
            const originalSizeKb = Math.round(originalSize / 1024 * 100) / 100
            console.log(`${file} is ${zippedSizeKb} Kb (${originalSizeKb} Kb unzipped)`)
        }
    }
}
