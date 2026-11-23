// Supabase queries resolve to { data, error } instead of throwing.
// unwrap() returns `data` or throws, so models can use plain async/await.
export const unwrap = ({ data, error }) => {
  if (error) {
    const failure = new Error(error.message);
    failure.code = error.code; // lets errorHandler map Postgres codes (e.g. 23505 → 409)
    throw failure;
  }
  return data;
};
