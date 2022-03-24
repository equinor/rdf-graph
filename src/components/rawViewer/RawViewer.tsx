import { FC } from 'react';

interface RawViewerProps {
	content: string;
}

export const RawViewer: FC<RawViewerProps> = ({ content }: RawViewerProps) => {
	const parseResult = (r: string): string => {
		try {
			return JSON.stringify(JSON.parse(r), null, 4);
		} catch (error) {
			return r;
		}
	};

	return (
		<div className="Raw">
			<pre>{parseResult(content)}</pre>
		</div>
	);
};

export default RawViewer;
