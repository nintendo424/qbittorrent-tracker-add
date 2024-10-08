import os from 'os';
import process from 'process';
import Bree from 'bree';

import { ENVIRONMENT_VARIABLES, API_ENDPOINTS, DEFAULTS } from './constants';

let qBittorrentEndpoint: string | undefined, cron: string, sid: string, HEADERS: { Authorization: string; };

const bree = new Bree();

process.on('SIGINT', async () => {
    console.info('Shutting down');
    await bree.stop();
    await logout();
    process.exit(0);
});

const main = async () => {
    init();
    await login();

    console.info(`Creating the schedule job with cron ${cron}.`);
    bree.add({
        name: 'Update Trackers',
        interval: cron,
        path: performUpdateDefaultTracker
    });
    bree.start();
}

const init = () => {
    qBittorrentEndpoint = process.env[ENVIRONMENT_VARIABLES.QBITTORRENT_ENDPOINT];
    const qBittorrentUsername = process.env[ENVIRONMENT_VARIABLES.QBITTORRENT_USERNAME];
    const qBittorrentPassword = process.env[ENVIRONMENT_VARIABLES.QBITTORRENT_PASSWORD];

    if (!qBittorrentEndpoint || !qBittorrentUsername || !qBittorrentPassword) {
        throw new Error('Invalid configuration: endpoint or username or password is not specified.');
    }

    cron = process.env[ENVIRONMENT_VARIABLES.CRON] || DEFAULTS.HOURLY_CRON;

    HEADERS = {
        Authorization: `Basic ${Buffer.from(`${qBittorrentUsername}:${qBittorrentPassword}`).toString('base64')}`
    }
}

const login = async () => {
    console.info('Logging in.');
    await fetch(`${qBittorrentEndpoint}${API_ENDPOINTS.LOGIN}`, )
    const response = await fetch(
        `${qBittorrentEndpoint}${API_ENDPOINTS.LOGIN}`,
        {
            method: 'POST',
            headers: HEADERS
        }
    );

    const sidCookieValue = response.headers.getSetCookie().filter(cookie => cookie.includes('SID'))[0];
    if (!sidCookieValue) {
        throw new Error('Cookie SID not found.');
    }

    // let cookie = Cookie.parse(sidCookieValue);
    // console.debug(`SID=${cookie.value}`);

    // console.info('Saving SID cookie.');
    //sid = cookie.value;
}

const logout = async () => {
    try {
        await fetch(`${qBittorrentEndpoint}${API_ENDPOINTS.LOGOUT}`, { method: 'POST' });
    } catch (ignored) {}

    console.info('Logged out.');
}

const performUpdateDefaultTracker = async () => {
    try {
        const trackerList = await downloadTrackerList();
        await setDefaultTrackers(trackerList);
    } catch (error: any) {
        console.error(error.message);
    }
}

const downloadTrackerList = async () => {
    console.info('Downloading trackers list.');
    const trackerListUrl = process.env[ENVIRONMENT_VARIABLES.TRACKER_LIST] || DEFAULTS.TRACKER_LIST;
    const response = await fetch(trackerListUrl);
    const trackers = await (response.text());
    return trackers.split(os.EOL).filter(line => line);
}

const setDefaultTrackers = async (defaultTrackers: string[]) => {
    console.info('Updating default trackers.');

    await fetch(`${qBittorrentEndpoint}${API_ENDPOINTS.SET_PREFERENCES}`, {
        method: 'POST',
        body: JSON.stringify({
            'add_trackers_enabled': true,
            'add_trackers': defaultTrackers
        }),
        headers: HEADERS
    });
}

main();