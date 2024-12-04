import { getAccessToken } from '../../lib/getAllUgixFeatures';
import { emitToast } from '../../lib/toastEmitter';
import { plotResource } from '../../types/plotResource';
import { fetchDataChunk } from './fetchData';

export async function progressiveFetch(
    baseUrl: string,
    resource: plotResource,
    startDate: Date,
    endDate: Date,
    maxDays: number,
    dataAccumulator: Object[],
    showNoAccessText: Function
) {
    const { error, token, status } = await getAccessToken(resource);
    if (error && status === 401) {
        emitToast('error', `Unable to get access token`);
        throw new Error(`no-access: ${error}`);
    }
    if (error && status === 403) {
        showNoAccessText();
        return;
    }
    if (!token) {
        throw new Error('Unable to get access token');
    }

    let currentDays = maxDays;


    while (currentDays > 1) {
        const rangeStart = new Date(startDate);
        const rangeEnd = new Date(rangeStart);
        rangeEnd.setDate(rangeStart.getDate() + currentDays);


        const formattedStartDate = rangeStart.toISOString();
        const formattedEndDate = rangeEnd.toISOString();

        const success = await fetchDataChunk(
            `${baseUrl}&timerel=during&time=${formattedStartDate}&endtime=${formattedEndDate}`,
            token,
            dataAccumulator,

        );
        if (success) break;

        currentDays = Math.floor(currentDays / 2);
    }


    while (currentDays < maxDays) {
        const lastStartDate = new Date(startDate);
        const lastEndDate = new Date(lastStartDate);
        lastEndDate.setDate(lastStartDate.getDate() + currentDays);

        const nextEndDate = new Date(lastEndDate);
        nextEndDate.setDate(nextEndDate.getDate() + 3);


        if (nextEndDate > endDate) break;


        const formattedLastEndDate = lastEndDate.toISOString();
        const formattedNextEndDate = nextEndDate.toISOString();

        const success = await fetchDataChunk(
            `${baseUrl}&timerel=during&time=${formattedLastEndDate}&endtime=${formattedNextEndDate}`,
            token,
            dataAccumulator,

        );
        if (!success) break;

        currentDays += 3;
    }
}
