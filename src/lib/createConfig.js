import findConfig from 'find-config';
import fs from 'fs';
import path from 'path';

const configFile = findConfig('.kibconfig');
const configFromFile = configFile ? JSON.parse(fs.readFileSync(configFile, 'utf-8')) : { profiles: {} };

function coalesce(...args) {
    let value;

    for (const arg of args) {
        if (arg !== null && arg !== undefined) {
            value = arg;
            break;
        }
    }
    return value;
}

export function _createConfig(program, profileName, config) {
    const profile = profileName ? config.profiles[profileName] : {};

    if (!profile) {
        console.error(`Unknown profile ${profileName}`);
        process.exit(1);
    }

    const basedir = configFile ? path.dirname(configFile) : '.';
    const givenDatadir = coalesce(program.datadir, profile.datadir, config.datadir, 'data');
    const datadir = path.isAbsolute(givenDatadir) ? givenDatadir : path.join(basedir, givenDatadir);

    return {
        datadir,
        url: coalesce(program.url, profile.url, config.url),
        query: coalesce(program.query, profile.query, config.query, '*'),
        delete: coalesce(program.delete, profile.delete, config.delete, false),
        verbose: coalesce(program.verbose, profile.verbose, config.verbose, false)
    };
}

export default function createConfig(program, profileName) {
    return _createConfig(program, profileName, configFromFile);
}

