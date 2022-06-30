import { Parser } from 'n3';
export const turtle2RdfTriples = (turtle: string) => new Parser({ format: 'Turtle' }).parse(turtle);
