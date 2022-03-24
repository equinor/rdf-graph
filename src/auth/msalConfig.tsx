import { Configuration } from '@azure/msal-browser';

import { EnvironmentVariables } from '../environmentVariables';

export const getMsalConfig = (): Configuration => {
	return {
		auth: {
			clientId: getClientId(),
			authority: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0',
		},
		cache: {
			cacheLocation: 'localStorage',
			storeAuthStateInCookie: false,
		},
	};
};

const getClientId = (): string => {
	switch (EnvironmentVariables.ENVIRONMENT) {
		case 'localhost':
		case 'dev':
		case 'test':
		case 'prod':
			return 'd772a59e-43de-4992-9634-6e295e04d025';
		default:
			console.warn('Unknown environment:', EnvironmentVariables.ENVIRONMENT);
			return '';
	}
};
