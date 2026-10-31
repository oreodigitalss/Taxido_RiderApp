import Echo from 'laravel-echo';
import { getValue } from './localstorage';
import { URL as API_URL } from '@src/api/config';

// @ts-ignore
const PusherClient =
  require('pusher-js/react-native').Pusher ||
  require('pusher-js/react-native');

PusherClient.logToConsole = __DEV__;

// @ts-ignore
window.Pusher = PusherClient;

let echoInstance: any = null;
let cachedToken: string | null = null;

const getEchoInstance = async () => {
  const token = await getValue('token');

  if (echoInstance && cachedToken === token) {
    return echoInstance;
  }

  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch (e) {
      console.error('Error disconnecting stale Echo instance:', e);
    }
  }

  cachedToken = token;

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: '32b114c5d9838fa6aa28',
    cluster: 'ap2',
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    Pusher: PusherClient,
    authEndpoint: `${API_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
};

export default getEchoInstance;