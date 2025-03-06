import axios from 'axios';
import { emitToast } from '../../lib/toastEmitter';

export async function fetchData(
    url: string,
    token: string,
    dataAccumulator: Object[],
    setIsDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>,
    isDataFetched?: boolean
): Promise<boolean> {
    try {
        const res = await axios.get(url, { headers: { token } });

        if (res.status === 200 && res.data.results) {
            dataAccumulator.push(...res.data.results);
            setIsDialogOpen && setIsDialogOpen(false);
            return true;
        }

        if (res.status === 204) {
            setIsDialogOpen && setIsDialogOpen(false);
            if (!isDataFetched) {
                console.log("Skipping multiple 'No content available' toasts.");
            }
            return true;
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 413) {
                if (!isDataFetched) {
                    console.log("Skipping multiple 'Payload too large' toasts.");
                }
                return false;
            }
        }
        emitToast('error', 'An error occurred while fetching data');
        console.error(error);
        throw new Error(`fetch-failed: ${error}`);
    }
    return false;
}

