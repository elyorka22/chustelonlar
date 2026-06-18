export type ActionError = { error: string };

export type ActionSuccess<T extends object = Record<string, never>> = {
  success: true;
} & T;

export type ActionResult<T extends object = Record<string, never>> =
  | ActionError
  | ActionSuccess<T>;

export function isActionError(
  result: ActionError | ActionSuccess | Record<string, unknown>
): result is ActionError {
  return "error" in result && typeof result.error === "string";
}
