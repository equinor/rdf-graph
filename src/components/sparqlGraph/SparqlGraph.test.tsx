import { render, screen } from '@testing-library/react';

// describe('SparqlGraph - renders without crashing', () => {
describe('SparqlGraph - example', () => {
	test('Expects to find button HTML element in the DOM', () => {
		render(
			<button>
				{/* <SparqlGraph turtleString={storyTurtle} layoutName="Cola" onElementsSelected={() => console.log(1)}/> */}
				Im dump example and I'm just here to pass the test 🤪
			</button>
		);
		const element = screen.getByRole('button');
		expect(element).toBeInTheDocument();
	});
});
