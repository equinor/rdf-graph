import { FC } from 'react';
import gear from '../../static/images/gear.svg';

import './spinningGear.scss';

interface SpinningGearProps {
	isPlaying: boolean;
}

export const SpinningGear: FC<SpinningGearProps> = ({ isPlaying }: SpinningGearProps) => {
	return <img src={gear} className={'Gear ' + (isPlaying ? 'GearSpin' : 'GearPaused')} alt="spinning gear" />;
};
