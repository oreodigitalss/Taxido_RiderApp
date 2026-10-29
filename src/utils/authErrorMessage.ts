function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = readMessage(item);
      if (message) {
        return message;
      }
    }
    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of ["message", "error", "errors", "data", "response"]) {
    const message = readMessage(value[key]);
    if (message) {
      return message;
    }
  }

  const errors = value.errors;
  if (isRecord(errors)) {
    for (const item of Object.values(errors)) {
      const message = readMessage(item);
      if (message) {
        return message;
      }
    }
  }

  return undefined;
}

export function authErrorMessage(value: unknown, fallback: string): string {
  return readMessage(value) ?? fallback;
}
