
'use server';

/**
 * @fileOverview A React code generation AI agent.
 *
 * - generateReactCode - A function that handles the React code generation process.
 * - GenerateReactCodeInput - The input type for the generateReactCode function.
 * - GenerateReactCodeOutput - The return type for the generateReactCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReactCodeInputSchema = z.object({
  projectIdea: z.string().describe('The user provided project idea.'),
  projectPlan: z.string().describe('The project plan, broken down into milestones.'),
  flowchart: z.string().describe('The flowchart diagram as an SVG string.'),
});
export type GenerateReactCodeInput = z.infer<typeof GenerateReactCodeInputSchema>;

const GeneratedFileSchema = z.object({
  fileName: z.string().describe("The full path and filename for the generated file (e.g., 'src/app/page.tsx' or 'src/components/my-card.tsx')."),
  fileContent: z.string().describe("The complete code content for this file."),
});

const GenerateReactCodeOutputSchema = z.object({
  files: z.array(GeneratedFileSchema).describe("An array of generated React files, each with a filename and its content."),
  globalStyles: z.string().optional().describe("Optional global CSS styles or Tailwind CSS utility class recommendations."),
});
export type GenerateReactCodeOutput = z.infer<typeof GenerateReactCodeOutputSchema>;

export async function generateReactCode(input: GenerateReactCodeInput): Promise<GenerateReactCodeOutput> {
  return generateReactCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReactCodePrompt',
  input: {schema: GenerateReactCodeInputSchema},
  output: {schema: GenerateReactCodeOutputSchema},
  prompt: `You are a senior full-stack developer specializing in Next.js (App Router) and React, tasked with generating a complete set of starter files for a web application.

Project Idea: {{{projectIdea}}}
Project Plan: {{{projectPlan}}}
Flowchart (SVG):
{{{flowchart}}}

Your task is to:
1.  Generate multiple React component files (.tsx). These should include a main page component (e.g., \`src/app/page.tsx\`) and any necessary sub-components. Each file should be complete, runnable, and adhere to modern React best practices.
    *   For each file, provide a fully qualified \`fileName\` (e.g., \`src/components/feature-card.tsx\`) and its \`fileContent\`.
    *   Ensure components are functional, use TypeScript, and import types correctly.
    *   Utilize ShadCN UI components (e.g., <Button>, <Card>) where appropriate for UI elements.
    *   Use \`lucide-react\` for icons if needed.
    *   Use \`https://placehold.co/<width>x<height>.png\` for placeholder images and include \`data-ai-hint\` attributes with 1-2 keywords.
2.  Generate global CSS styles or Tailwind CSS utility class recommendations suitable for the project. This should be a single string for the \`globalStyles\` field. If no specific global styles are needed beyond default Tailwind, you can provide an empty string or a comment like "/* Tailwind CSS utilities will be primarily used. */".
3.  The output MUST be a JSON object adhering to the specified output schema. Do NOT include any explanations, comments outside the code, or markdown formatting around the JSON.
4.  Ensure every component returns a single root JSX element.

Output ONLY the JSON object.

Example of the expected output structure:
{
  "files": [
    {
      "fileName": "src/app/page.tsx",
      "fileContent": "import React from 'react';\\nimport { MyWidget } from '@/components/my-widget';\\n\\nexport default function HomePage() {\\n  return (\\n    <main>\\n      <h1>Welcome</h1>\\n      <MyWidget />\\n    </main>\\n  );\\n}"
    },
    {
      "fileName": "src/components/my-widget.tsx",
      "fileContent": "import React from 'react';\\nimport { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';\\n\\nexport function MyWidget() {\\n  return (\\n    <Card>\\n      <CardHeader><CardTitle>My Widget</CardTitle></CardHeader>\\n      <CardContent><p>Widget content here.</p></CardContent>\\n    </Card>\\n  );\\n}"
    }
  ],
  "globalStyles": "body { font-family: sans-serif; }\\n.my-custom-class { color: blue; }"
}
`,
});

const generateReactCodeFlow = ai.defineFlow(
  {
    name: 'generateReactCodeFlow',
    inputSchema: GenerateReactCodeInputSchema,
    outputSchema: GenerateReactCodeOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        // Fallback if AI returns no output
        return {
          files: [{ fileName: "src/app/error.tsx", fileContent: "export default function ErrorPage() { return <p>Code generation failed to produce output.</p>; }" }],
          globalStyles: "/* Error generating styles */"
        };
      }
      // Ensure there's at least one file, even if it's an error message
      if (!output.files || output.files.length === 0) {
        output.files = [{ fileName: "src/app/error.tsx", fileContent: "export default function ErrorPage() { return <p>AI did not generate any files.</p>; }" }];
      }
      return output;
    } catch (error) {
      console.error("Error in generateReactCodeFlow:", error);
      // Fallback in case of prompt execution error
      return {
        files: [{ fileName: "src/app/error.tsx", fileContent: `export default function ErrorPage() { return <p>An error occurred during code generation: ${String(error)}</p>; }` }],
        globalStyles: `/* Error during style generation: ${String(error)} */`
      };
    }
  }
);

