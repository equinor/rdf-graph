export const short = (url: string | undefined): string => {
	if (!url) throw new Error('undefined url');
	const parts = url
		.replace(/\/$/, '') // Remove trailing slash
		.split('/'); // split on remaining slashes
	const shortName = parts.pop(); // get last part
	if (shortName) {
		return shortName;
	}
	throw new Error(`Invalid url ${url}`);
};
