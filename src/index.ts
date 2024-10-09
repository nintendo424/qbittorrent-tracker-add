import process from 'node:process';
import { SHARE_ENV } from 'node:worker_threads';
import path from 'node:path';
import Bree from 'bree';
import Graceful from '@ladjs/graceful';

import {API_ENDPOINTS, DEFAULTS, ENVIRONMENT_VARIABLES} from './constants';


let qBittorrentEndpoint: string,
    qBittorrentUsername: string,
    qBittorrentPassword: string,
    interval: string,
    sid: string;

const init = () => {
    qBittorrentEndpoint = process.env[ENVIRONMENT_VARIABLES.QBITTORRENT_ENDPOINT]!;
    qBittorrentUsername = process.env[ENVIRONMENT_VARIABLES.QBITTORRENT_USERNAME]!;
    qBittorrentPassword = process.env[ENVIRONMENT_VARIABLES.QBITTORRENT_PASSWORD]!;

    interval = process.env[ENVIRONMENT_VARIABLES.INTERVAL] || DEFAULTS.DAILY_INTERVAL;
}

const login = async () => {
    console.info('Logging in.');
    const data = {
        username: qBittorrentUsername,
        password: qBittorrentPassword
    };

    const response = await fetch(`${qBittorrentEndpoint}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        body: new URLSearchParams(data)
    });
    if (!response.ok) {
        console.log('Error logging in');
    }
    sid = response.headers.getSetCookie()[0];
}

const logout = async () => {
    try {
        await fetch(`${qBittorrentEndpoint}${API_ENDPOINTS.LOGOUT}`, {
            headers: {
                'Cookie': sid
            },
            method: 'POST'
        });
    } catch (ignored) {}
    console.info('Logged out.');
}

const main = async () => {
    init();
    await login();

    console.info(`Creating the schedule job with interval: ${interval}.`);
    const bree = new Bree({
        root: path.join(__dirname, 'jobs'),
        defaultExtension: process.env.TS_NODE ? 'ts' : 'js',
        jobs:[{
            name: 'tracker',
            interval: interval,
            worker: {
                env: SHARE_ENV,
                workerData: {
                    qBittorrentEndpoint,
                    sid
                }
            }
        }],
        workerMessageHandler: (message: any) => {
            console.log(`${message.name}: ${message.message}`);
        }
    });
    const graceful = new Graceful({
        brees: [bree],
        customHandlers: [logout]
    });
    graceful.listen();
    await bree.start();
}

main();