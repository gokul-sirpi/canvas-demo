import axios from 'axios';
import envurls from './config';
import { emitToast } from '../lib/toastEmitter';
import { Resource } from '../types/resource';

export default async function getResourceServerRegURL(
  selectedResource: Resource
): Promise<string> {
  try {
    const response = await axios.get(
      `${envurls.ugixServer}cat/v1/item?id=${selectedResource.resourceServer}`
    );

    console.log(response);

    const serverUrl = response?.data.results[0]?.resourceServerRegURL;

    if (!serverUrl) {
      throw new Error('Server URL not found');
    }

    return serverUrl;
  } catch (error) {
    emitToast('error', 'Failed to get server ID');
    console.error(error);
    throw new Error('Failed to retrieve server URL');
  }
}
