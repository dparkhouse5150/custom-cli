import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main'

const parseArgsInfoOptions = (rawArgs) => {
    const args = arg({
        '--git': Boolean,
        '--yes': Boolean,
        '--install': Boolean,
        // aliases
        'g': '--git',
        '-y': '--yes',
        '-i': '--install'
    })

    return {
        skipPrompt: args['--yes'] || false,
        git: args['--git'] || false,
        template: args._[0],
        runInstall: args['--install'] || false
    }
}

const promptForMissingOptions = async (options) => {
    const defaultTemplate = 'javascript'

    if (options.skipPrompt) {
        return {
            ...options, 
            template: options.template || defaultTemplate,
        }
    }

    const questions = [];

    if (!options.template) {
        questions.push({
            type: 'list',
            name: 'template',
            message: 'please choose with project template to use',
            choices: ['javascript', 'typescript'],
            default: defaultTemplate
        })
    }

    if (!options.git) {
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'should i initialize an empty git respo',
            default: false
        })
    }

    const answer = await inquirer.prompt(options)

    return {
        ...options,
        template: options.template || answer.template,
        git: options.git || answer.git
    }
}

export const cli = async (arg) => {
    let options = parseArgsInfoOptions(args)
    options = await promptForMissingOptions(options)

    await createProject(options)
}

