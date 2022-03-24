export const getErrorMsg = (error: any): string => {
	if (typeof error === 'string') {
		return error;
	} else if (error instanceof Error) {
		return error.message; // works, `e` narrowed to Error
	} else {
		return 'Unknown error';
	}
};
