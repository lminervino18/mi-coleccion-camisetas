/**
 * FormData entries can be files, so text fields are read explicitly rather than stringified.
 */
export const textField = (form: FormData, name: string): string => {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
};
