'use strict'

process.env.NODE_ENV = 'production'

const chalk = require('chalk')
const packager = require('electron-packager')

const buildConfig = require('./build.config.js')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '

bundleApp()

function bundleApp() {
    packager(buildConfig, (err, appPaths) => {
        if (err) {
            console.log(`\n${errorLog}${chalk.yellow('`electron-packager`')} says...\n`)
            console.log(err + '\n')
        } else {
            console.log(`\n${doneLog}\n`)
        }
    })
}

// console.log(buildConfig)