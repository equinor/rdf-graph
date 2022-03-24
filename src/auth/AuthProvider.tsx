import { useEffect } from 'react';
import { MsalProvider, useMsal, useAccount, useIsAuthenticated, useMsalAuthentication } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { Button } from '@equinor/eds-core-react';

import msalInstance from './msalHelpers';

interface AuthHandlerProps {
	children: JSX.Element;
}

const AuthHandler: React.FC<AuthHandlerProps> = (props: AuthHandlerProps) => {
	const { instance, accounts } = useMsal();
	const { error } = useMsalAuthentication(InteractionType.Redirect);
	const isAuthenticated = useIsAuthenticated();
	const account = useAccount(accounts[0] || {});

	const loginRequest = {
		scopes: ['2ff9de24-0dba-46e0-9dc1-096cc69ef0c6/.default'],
	};

	useEffect(() => {
		if (isAuthenticated) {
			instance.setActiveAccount(account);
		}
	}, [account, instance, isAuthenticated]);

	useEffect(() => {
		if (error) console.log('Login error', error);
	}, [error]);

	const handleLogin = () => {
		instance.loginPopup(loginRequest).catch((e) => {
			console.error('--->>>', 'handleLogin:', e);
		});
	};

	return (
		<>
			{!isAuthenticated && <Button onClick={() => handleLogin()}>Log in</Button>}
			{props.children}
		</>
	);
};

const AuthProvider: React.FC<{ children: JSX.Element }> = (props) => (
	<MsalProvider instance={msalInstance}>
		<AuthHandler {...props} />
	</MsalProvider>
);

export default AuthProvider;
export { msalInstance };
