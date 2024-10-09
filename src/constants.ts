export enum ENVIRONMENT_VARIABLES {
    QBITTORRENT_ENDPOINT = 'QBITTORRENT_ENDPOINT',
    QBITTORRENT_USERNAME = 'QBITTORRENT_USERNAME',
    QBITTORRENT_PASSWORD = 'QBITTORRENT_PASSWORD',
    TRACKER_LIST = 'QBITTORRENT_TRACKER_LIST',
    INTERVAL = 'INTERVAL'
}

export enum API_ENDPOINTS {
    LOGIN = '/api/v2/auth/login',
    LOGOUT = '/api/v2/auth/logout',
    SET_PREFERENCES = '/api/v2/app/setPreferences'
}

export enum DEFAULTS {
    TRACKER_LIST = 'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt',
    DAILY_INTERVAL = 'at 4:00 am'
}