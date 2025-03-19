export const createMessage = (body, type, source, options) => {
  return {
    body,
    type,
    source,
    ...options,
  };
};
