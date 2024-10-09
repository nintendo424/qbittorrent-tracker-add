import process from 'node:process';
import { workerData, parentPort } from 'node:worker_threads';
import { API_ENDPOINTS, DEFAULTS, ENVIRONMENT_VARIABLES } from '../constants';

(async () => {
    parentPort?.postMessage('Downloading trackers list.');
    const trackerListUrl = process.env[ENVIRONMENT_VARIABLES.TRACKER_LIST] || DEFAULTS.TRACKER_LIST;
    const response = await fetch(trackerListUrl);
    const trackers = await response.text();

    const data = {
        json: JSON.stringify({
            add_trackers_enabled: true,
            add_trackers: trackers
        })
    }

    parentPort?.postMessage('Updating default trackers.');
    const updateResponse = await fetch(`${workerData.qBittorrentEndpoint}${API_ENDPOINTS.SET_PREFERENCES}`, {
        method: 'POST',
        headers: {
            'Cookie': workerData.sid
        },
        body: new URLSearchParams(data)
    });
    if (updateResponse.status !== 200) {
        parentPort?.postMessage(updateResponse.statusText);
    }
    parentPort?.postMessage('done')
    process.exit(0);
})();
