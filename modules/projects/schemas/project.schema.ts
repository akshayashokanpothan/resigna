import { z } from 'zod';

export const PROJECT_NAME_MIN = 2;
export const PROJECT_NAME_MAX = 100;
export const PROJECT_DESCRIPTION_MAX = 500;

const projectName = z
  .string()
  .trim()
  .min(PROJECT_NAME_MIN, `Project name must be at least ${PROJECT_NAME_MIN} characters`)
  .max(PROJECT_NAME_MAX, `Project name must be ${PROJECT_NAME_MAX} characters or fewer`);

const projectDescription = z
  .string()
  .trim()
  .max(
    PROJECT_DESCRIPTION_MAX,
    `Description must be ${PROJECT_DESCRIPTION_MAX} characters or fewer`,
  )
  .optional();

/** What the user types into the create and rename forms. */
export const projectFormSchema = z.object({
  name: projectName,
  description: projectDescription,
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
