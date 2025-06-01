
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

  Based on the following project idea, generate a flowchart diagram as a self-contained SVG string that visualizes the project workflow.
  Project Idea: {{{$input}}}

  The SVG should be well-formed and valid.
  It should use standard SVG elements like <rect>, <text>, <line>, and <path>.
  Nodes should typically be rectangles with text inside. Use appropriate font sizes and padding for readability.
  Edges should be lines or paths, preferably with arrowheads indicating direction.
  The SVG must include an appropriate viewBox, for example: '0 0 600 400'.
  Ensure all text is clearly visible against node backgrounds.
  Do not include any JavaScript, <script> tags, or other interactive elements within the SVG. Focus solely on static visual representation.
  Do not include any explanation, preamble, or any text outside the <svg>...</svg> tags. Only output the SVG string.

  When styling, use fill and stroke attributes with HSL CSS variables for colors (e.g., fill="hsl(var(--card))", stroke="hsl(var(--primary))") so the flowchart adapts to the application's theme.
  The style block should look like this:
  <style>
    .node-rect { fill: hsl(var(--card)); stroke: hsl(var(--primary)); stroke-width: 2; rx: 5; }
    .node-text { fill: hsl(var(--card-foreground)); font-family: sans-serif; font-size: 14px; text-anchor: middle; dominant-baseline: middle; }
    .edge-line { stroke: hsl(var(--foreground)); stroke-width: 2; }
    .arrowhead-fill { fill: hsl(var(--foreground)); }
  </style>
  And arrowheads should use a class for their fill, like <path d="..." class="arrowhead-fill" />

  Here is an example of a simple, valid SVG flowchart using *literal colors* for your reference of structure (but you should use HSL variables as described above for the actual output):
<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <style>
    .node-rect { fill: #FFFFFF; stroke: #007bff; stroke-width: 2; rx: 5; }
    .node-text { fill: #333333; font-family: sans-serif; font-size: 14px; text-anchor: middle; dominant-baseline: middle; }
    .edge-line { stroke: #333333; stroke-width: 2; }
    .arrowhead-fill { fill: #333333; }
  </style>
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L10,3.5 L0,7 Z" class="arrowhead-fill" />
    </marker>
  </defs>
  <g>
    <!-- Node 1: Start -->
    <rect x="50" y="50" width="120" height="60" class="node-rect" />
    <text x="110" y="80" class="node-text">Start</text>

    <!-- Node 2: Process Data -->
    <rect x="240" y="150" width="120" height="60" class="node-rect" />
    <text x="300" y="180" class="node-text">Process Data</text>

    <!-- Node 3: End -->
    <rect x="430" y="250" width="120" height="60" class="node-rect" />
    <text x="490" y="280" class="node-text">End</text>

    <!-- Edge 1: Start to Process Data -->
    <line x1="110" y1="110" x2="300" y2="150" class="edge-line" marker-end="url(#arrowhead)" />

    <!-- Edge 2: Process Data to End -->
    <line x1="300" y1="210" x2="490" y2="250" class="edge-line" marker-end="url(#arrowhead)" />
  </g>
</svg>`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
});

const generateFlowchartFlow = ai.defineFlow(
  {
    name: 'generateFlowchartFlow',
    inputSchema: GenerateFlowchartInputSchema,
    outputSchema: GenerateFlowchartOutputSchema,
  },
  async input => {
    const fallbackSvgError = '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="hsl(var(--muted))" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-family="sans-serif" font-size="16px">Flowchart Generation Error (AI failed to produce valid SVG)</text></svg>';
    const fallbackSvgWarn = '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="hsl(var(--muted))" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-family="sans-serif" font-size="16px">Flowchart Not Available (AI output was invalid or empty)</text></svg>';
    try {
      const result = await generateFlowchartPrompt(input);
      if (result && typeof result.output === 'string' && result.output.trim() !== '' && result.output.trim().toLowerCase().startsWith('<svg')) {
        return result.output;
      }
      console.warn('Flowchart prompt completed but output was not a valid non-empty SVG string. Output received:', result?.output);
      return fallbackSvgWarn;
    } catch (error) {
      console.error('Error during generateFlowchartPrompt execution. This means the AI model likely failed to return a string, or there was a safety/schema validation issue. Error details:', error);
      return fallbackSvgError;
    }
  }
);

    