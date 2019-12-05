import { StepValue, Workflow } from "@qawolf/types";

export const getEnvValues = (workflow: Workflow): StepValue[] => {
  /**
   * Use QAW_WORKFLOWNAME_STEPINDEX environment variable for step value if it is defined.
   * Ex. QAW_LOGIN_0=...
   */
  const values = workflow.steps.map((_, index) => {
    const key = `QAW_${workflow.name.toUpperCase()}_${index}`;

    const envValue = process.env[key];
    if (typeof envValue !== "undefined") {
      return envValue;
    }
  });

  return values;
};