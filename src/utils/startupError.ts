export const sanitizeServerError = (data: unknown, status: number) => {
  let message: unknown;
  if (typeof data === "string") {
    const htmlHeading = data.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1];
    const htmlTitle = data.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
    message = htmlHeading ?? htmlTitle ?? data;
  } else if (data && typeof data === "object") {
    const responseData = data as Record<string, unknown>;
    message =
      responseData.message ??
      responseData.error ??
      responseData.detail ??
      responseData.title;
  }

  if (typeof message === "string") {
    const sanitized = message
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
    if (sanitized) {
      return sanitized.replace(new RegExp(`^${status}\\s+`), "");
    }
  }

  return status === 404 ? "Not Found" : "The server rejected the request";
};

export const formatStartupError = (error: unknown) => {
  if (error && typeof error === "object") {
    const failure = error as Record<string, unknown>;
    const status = typeof failure.status === "number" ? failure.status : undefined;
    if (status !== undefined) {
      return `Rider settings request failed (HTTP ${status}): ${sanitizeServerError(
        failure.data,
        status,
      )}`;
    }
    if (typeof failure.message === "string" && failure.message.trim()) {
      return failure.message;
    }
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unable to start the app. Check your connection and retry.";
};
