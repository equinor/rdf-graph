import { EnvironmentsViewProps } from '../components';

type ApiConfig = {
	baseUrl: string;
	scopes: string[];
};

export const getApiConfig = (environment: EnvironmentsViewProps): ApiConfig => {
	const env2ApiConfig: { [key in EnvironmentsViewProps]: ApiConfig } = {
		localhost: {
			baseUrl: 'http://localhost:8080',
			scopes: ['2ff9de24-0dba-46e0-9dc1-096cc69ef0c6/.default'],
		},
		'stid-dev': {
			baseUrl: 'https://dugtriofuseki-dev-stid.azurewebsites.net',
			scopes: ['2ff9de24-0dba-46e0-9dc1-096cc69ef0c6/.default'],
		},
		dev: {
			baseUrl: 'https://dugtriofuseki-dev.azurewebsites.net',
			scopes: ['2ff9de24-0dba-46e0-9dc1-096cc69ef0c6/.default'],
		},
		test: {
			baseUrl: 'https://dugtriofuseki-test.azurewebsites.net',
			scopes: ['2ff9de24-0dba-46e0-9dc1-096cc69ef0c6/.default'],
		},
		prod: {
			baseUrl: 'https://dugtriofuseki.azurewebsites.net',
			scopes: ['2ff9de24-0dba-46e0-9dc1-096cc69ef0c6/.default'],
		},
	};

	return env2ApiConfig[environment];
};
