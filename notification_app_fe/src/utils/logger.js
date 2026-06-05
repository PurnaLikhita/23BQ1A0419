const LOG_URL = "http://4.224.186.213/evaluation-service/logs";

export async function Log(stack, level, packageName, message, token) {
  if (!token) return null;
  try {
    const res = await fetch(LOG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: packageName, message }),
    });
    return await res.json();
  } catch (err) {
    console.error("[Logger] Failed:", err.message);
    return null;
  }
}