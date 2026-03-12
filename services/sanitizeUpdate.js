export function sanitizeUpdate(body, forbiddenFields = []) {

  const sanitized = { ...body };

  for (const field of forbiddenFields) {
    delete sanitized[field];
  }

  return sanitized;
}