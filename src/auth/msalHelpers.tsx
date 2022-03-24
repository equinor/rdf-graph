import { PublicClientApplication } from '@azure/msal-browser';

import { getMsalConfig } from './msalConfig';
import { UserNotLoggedInError } from './UserNotLoggedInError';

const msalInstance = new PublicClientApplication(getMsalConfig());

export default msalInstance;

export const isUserLoggedIn = (): boolean => {
	const accounts = msalInstance.getAllAccounts();
	const activeAccount = msalInstance.getActiveAccount();
	return activeAccount !== null && accounts.length > 0;
};

export const getAccessToken = async (scopes: string[]): Promise<string> => {
	const accounts = msalInstance.getAllAccounts();
	const activeAccount = msalInstance.getActiveAccount();

	if (!isUserLoggedIn()) throw new UserNotLoggedInError();

	const tokenResponse = await msalInstance.acquireTokenSilent({ account: activeAccount || accounts[0], scopes });
	if (!tokenResponse.accessToken) {
		console.log('Acquire Token Silent failed, redirecting instead');
		await msalInstance.acquireTokenRedirect({ account: activeAccount || accounts[0], scopes });
	}

	return `Bearer ${tokenResponse.accessToken}`;
};
