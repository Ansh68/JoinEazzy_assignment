// Turns an axios error into a message that is safe to show to the user.
export const getErrorMessage = (error) => {
  if (error.response) return error.response.data?.message ?? 'Something went wrong';
  if (error.request) return 'Cannot reach the server. Check your connection and try again.';
  return 'Something went wrong';
};

// Converts the API's [{ field, message }] list into { field: message } for form inputs.
export const getFieldErrors = (error) =>
  Object.fromEntries((error.response?.data?.errors ?? []).map(({ field, message }) => [field, message]));
