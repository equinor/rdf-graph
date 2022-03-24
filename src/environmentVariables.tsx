export const fusekiEnvironments = ['localhost', 'dev', 'stid-dev', 'test', 'prod'] as const;
export type FusekiEnvironment = typeof fusekiEnvironments[number];

const getEnv = (): FusekiEnvironment => {
	const host2Env: { [key: string]: FusekiEnvironment } = {
		localhost: 'dev',
		'127.0.0.1': 'dev',
		'dugtrioleonardo-dev.azurewebsites.net': 'dev',
		'dugtrioleonardo-test.azurewebsites.net': 'test',
		'dugtrioleonardo.azurewebsites.net': 'prod',
	};

	return host2Env[window.location.hostname];
};

export const EnvironmentVariables = {
	ENVIRONMENT: getEnv(),
	ACCESS_IT_URL: 'https://accessit.equinor.com/',
};
