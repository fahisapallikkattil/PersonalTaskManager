'use server';
/**
 * @fileOverview An AI assistant that suggests detailed task descriptions based on a task title.
 *
 * - suggestTaskDescription - A function that handles the task description suggestion process.
 * - AiTaskDescriptionSuggesterInput - The input type for the suggestTaskDescription function.
 * - AiTaskDescriptionSuggesterOutput - The return type for the suggestTaskDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiTaskDescriptionSuggesterInputSchema = z.object({
  title: z.string().describe('The title of the task for which to suggest a description.'),
});
export type AiTaskDescriptionSuggesterInput = z.infer<typeof AiTaskDescriptionSuggesterInputSchema>;

const AiTaskDescriptionSuggesterOutputSchema = z.object({
  description: z.string().describe('A detailed suggested description for the task.'),
});
export type AiTaskDescriptionSuggesterOutput = z.infer<typeof AiTaskDescriptionSuggesterOutputSchema>;

export async function suggestTaskDescription(
  input: AiTaskDescriptionSuggesterInput
): Promise<AiTaskDescriptionSuggesterOutput> {
  return aiTaskDescriptionSuggesterFlow(input);
}

const aiTaskDescriptionSuggesterPrompt = ai.definePrompt({
  name: 'aiTaskDescriptionSuggesterPrompt',
  input: { schema: AiTaskDescriptionSuggesterInputSchema },
  output: { schema: AiTaskDescriptionSuggesterOutputSchema },
  prompt: `You are an AI assistant specialized in generating detailed and comprehensive task descriptions based on a given task title.
Your goal is to help users quickly define tasks by expanding a short title into a full description.

Generate a detailed description for the following task title:

Task Title: {{{title}}}

Ensure the description is clear, actionable, and covers potential aspects of the task without being overly verbose.`,
});

const aiTaskDescriptionSuggesterFlow = ai.defineFlow(
  {
    name: 'aiTaskDescriptionSuggesterFlow',
    inputSchema: AiTaskDescriptionSuggesterInputSchema,
    outputSchema: AiTaskDescriptionSuggesterOutputSchema,
  },
  async (input) => {
    const { output } = await aiTaskDescriptionSuggesterPrompt(input);
    return output!;
  }
);
