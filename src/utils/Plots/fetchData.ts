
import axios from 'axios';
import { emitToast } from '../../lib/toastEmitter';

export async function fetchData(
    url: string,
    token: string,
    dataAccumulator: Object[]
): Promise<boolean> {
    try {

        const res = await axios.get(url, { headers: { token } });
        if (res.status === 200 && res.data.results) {
            dataAccumulator.push(...res.data.results);
            return true;
        } else if (res.status === 204) {
            emitToast('info', 'No content available');
            return true;
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 413) {
            return false;
        }
        emitToast('error', 'An error occurred while fetching data');
        console.error(error);
    }
    return false;
}
