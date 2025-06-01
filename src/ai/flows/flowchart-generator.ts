
// src/ai/flows/flowchart-generator.ts
'use server';
/**
 * @fileOverview Generates a flowchart diagram as an SVG string, based on the natural language input.
 *
 * - generateFlowchart - A function that handles the flowchart generation process.
 * - GenerateFlowchartInput - The input type for the generateFlowchart function.
 * - GenerateFlowchartOutput - The return type for the generateFlowchart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlowchartInputSchema = z.string().describe('The project idea as natural language input.');
export type GenerateFlowchartInput = z.infer<typeof GenerateFlowchartInputSchema>;

const GenerateFlowchartOutputSchema = z.string().describe('The flowchart diagram as an SVG string.');
export type GenerateFlowchartOutput = z.infer<typeof GenerateFlowchartOutputSchema>;

export async function generateFlowchart(input: GenerateFlowchartInput): Promise<GenerateFlowchartOutput> {
  return generateFlowchartFlow(input);
}

const generateFlowchartPrompt = ai.definePrompt({
  name: 'generateFlowchartPrompt',
  input: {schema: GenerateFlowchartInputSchema},
  output: {schema: GenerateFlowchartOutputSchema},
  prompt: `You are an expert in creating flowchart diagrams for software projects.

  Based on the following project idea, generate a flowchart diagram as an SVG string that visualizes the project workflow.
  Project Idea: {{{$input}}}

  Ensure the SVG string is well-formed and valid.
  The SVG should be compatible with react-flow.
  Do not include any explanation or preamble, just output the SVG string.
  The generated SVG should have viewbox 0 0 600 400.
  Each node must have an id, label, x and y coordinates.
  Each edge must have a source and target.
  Here is an example, for reference:
<svg viewBox="0 0 600 400">
  <g class="react-flow__edges">
    <path class="react-flow__edge-path" d="M 100,50 C 150,50 150,150 200,150" marker-end="url(#react-flow__arrow)" stroke="black" stroke-width="2" fill="none"></path>
    <g class="react-flow__edge react-flow__edge-textwrapper">
      <text style="font-size: 12px; font-family: sans-serif; fill: rgb(0, 0, 0); transform: translate(-19.2105px, -6px); pointer-events: none; user-select: none;" class="react-flow__edge-textbg"></text>
      <text style="font-size: 12px; font-family: sans-serif; fill: rgb(0, 0, 0); transform: translate(-19.2105px, -6px); pointer-events: none; user-select: none;" class="react-flow__edge-text"></text>
    </g>
  </g>
  <g class="react-flow__nodes">
    <div class="react-flow__node react-flow__node-input" style="transform: translate(0px, 0px); z-index: 1;">
      <div class="react-flow__node-default">
        <div>Input</div>
      </div>
    </div>
    <div class="react-flow__node react-flow__node-default" style="transform: translate(200px, 100px); z-index: 1;">
      <div class="react-flow__node-default">
        <div>Process</div>
      </div>
    </div>
  </g>
  <defs>
    <marker id="react-flow__arrow" viewBox="-0 -5 10 10" refX="10" refY="0" orient="auto" markerWidth="7" markerHeight="7" fill="black">
      <path d="M 0,-5 L 10,0 L 0,5"></path>
    </marker>
  </defs>
</svg>`,
});

const generateFlowchartFlow = ai.defineFlow(
  {
    name: 'generateFlowchartFlow',
    inputSchema: GenerateFlowchartInputSchema,
    outputSchema: GenerateFlowchartOutputSchema,
  },
  async input => {
    const result = await generateFlowchartPrompt(input);
    if (typeof result.output === 'string') {
      // If the output is an empty string, it's still a valid string as per schema.
      // The FlowchartDisplay component will handle empty strings by rendering nothing.
      return result.output;
    }
    // If output is null, undefined, or not a string, return a default empty SVG.
    // This handles the case where the prompt output was null or otherwise invalid.
    console.warn('Flowchart generation did not return a string. Returning default empty SVG.');
    return '<svg viewBox="0 0 600 400"></svg>';
  }
);

