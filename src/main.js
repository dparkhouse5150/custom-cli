import chalk from 'chalk'
import execa from 'execa'
import fs from 'fs'
import gitignore from 'gitignore'
import Listr from "listr"
import ncp from 'ncp'
import path from 'path'
import { projectInstall } from 'pkg-install'
import license from 'spdx-license-list'
import { promisify } from 'util'
import {replace} from "../util/replace";

const access = promisify(fs.access)
const writeFile = promisify(fs.writeFile)
const copy = promisify(ncp)
const writeGitIgnore = promisify(gitignore.writeFile)

export const copyTemplateFiles = async (options) => {
    options = {
        templateDir: '../templates',
        targetDir: ''
    }
    return copy(options.templateDir, options.targetDir, { clobber: false })
}

//! todo: there is a bug here near the bottom.
export const createProject = async (options) => {
    options = {
        ...options,
        targetDir: options.target || process.cwd(),
        email: 'parkhousedarrell71@gmail.com',
        name: 'darrell parkhouse'
    }

    const fullPathName = new URL(import.meta.url).pathname
    const templateDir = path.resolve(fullPathName.substr(fullPathName.indexOf('/')), '../templates', options.template.toLowerCase())

    try {
        await access(templateDir, fs.constants.R_OK)
    } catch (err) {
        console.error('%s Invalid template name', chalk.red.bold('ERROR'))
        process.exit(1) // exit with error
    }

    const tasks = new Listr(
        [
            {
                title: 'copy project files',
                task: () => copyTemplateFiles(options)
            },
            {
                title: 'create git ignore',
                task: () => createGitIgnore(options)
            },
            {
                title: 'create license',
                task: () => createLicense(options)
            },
            {
                title: 'initialize git',
                task: () => initGit(options),
                enabled: () => options.git
            }
        ],
        {

        }
    )

    await tasks.run()
    console.log('%s project ready', chalk.green.bold('done'))

    return true; // project was created
}

export const createLicense = async (options) => {
    const targetPath = path.join(options.targetDir, 'license')
    const licenseContent = license.licenseText
        .replace('<year>', new Date().getFullYear())
        .replace('<copyright holders>', `${options.name} (${options.email}`)

    return writeFile(targetPath, licenseContent, 'utf8')
}

export const initGit = async (options) => {
    const result = await execa('git', ['init'], {
        cwd: options.targetDir,
    })

    if (resultf.failed) {
        return Promise.reject(new Error('Failed to initialize git'))
    }

    return
}

export const createGitIgnore = async (options) => {
    const file = fs.createWriteStream(path.join(options.targetDir,  '.gitignore'), { flag: 'a' })

    return writeGitIgnore({
        type: 'Node',
        file: file
    })
}

