let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzExY3MwMjAxNzlAbWFsbGFyZWRkeXVuaXZlcnNpdHkuYWMuaW4iLCJleHAiOjE3ODI4OTM2MTEsImlhdCI6MTc4Mjg5MjcxMSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaWZhdGUgTGltaXRlZCIsImp0aSI6IjVmYjM5YTQzLTUwOGUtNDA3NC05Mjg2LTg4NTg3NDE1OWM2NiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImR1ZGVrdWxhIHRheXlhYiIsInN1YiI6IjI3MDk4Mzc1LWQzNDItNDNmOS05ZDhlLWIwYWI3OWNlN2ViNSJ9LCJlbWFpbCI6IjIzMTFjczAyMDE3OUBtYWxsYXJlZGR5dW5pdmVyc2l0eS5hYy5pbiIsIm5hbWUiOiJkdWRla3VsYSB0YXl5YWIiLCJyb2xsTm8iOiIyMzExY3MwMjAxNzkiLCJhY2Nlc3NDb2RlIjoieHBRZGRkIiwiY2xpZW50SUQiOiIyNzA5ODM3NS1kMzQyLTQzZjktOWQ4ZS1iMGFiNzljZTdlYjUiLCJjbGllbnRTZWNyZXQiOiJtS1dLTW5KdXhocVBTWlh5In0.eUUwNvr6-BOPqPDVVHOol4Fm-ojnBkjVJj1nVC_PoVg";

const CREDENTIALS = {
  email: "2311cs020179@mallareddyuniversity.ac.in",
  name: "dudekula tayyab",
  accessCode: "xpQddd",
  rollNo: "2311cs020179",
  clientID: "27098375-d342-43f9-9d8e-b0ab79ce7eb5",
  clientSecret: "mKWKMnJuxhqPSZXy"
};

async function refreshToken() {
  try {
    const response = await fetch("http://4.224.186.213/evaluation-service/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(CREDENTIALS)
    });
    const data = await response.json();
    if (data.access_token) {
      token = data.access_token;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("evaluation_token", token);
      }
      return token;
    }
  } catch (error) {
    console.error("Token refresh failed in logger:", error.message);
  }
  return token;
}

async function getToken() {
  if (typeof window !== "undefined") {
    const cached = window.localStorage.getItem("evaluation_token");
    if (cached) return cached;
  }
  return token;
}

async function Log(stack, level, packageName, message) {
  let activeToken = await getToken();
  try {
    // Truncate message to 48 characters to respect API limit
    if (message && message.length > 48) {
      message = message.substring(0, 45) + "...";
    }
    let response = await fetch("http://4.224.186.213/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${activeToken}`
      },
      body: JSON.stringify({
        stack,
        level,
        package: packageName,
        message
      })
    });

    let text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }

    if (data.message === "invalid authorization token") {
      console.log("Token expired, refreshing in logger...");
      activeToken = await refreshToken();
      response = await fetch("http://4.224.186.213/evaluation-service/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          stack,
          level,
          package: packageName,
          message
        })
      });
      data = await response.json();
    }

    console.log("Log Sent Successfully");
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
}

// Support both ESM and CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = Log;
  // Also export credentials and helper functions so they can be reused
  module.exports.CREDENTIALS = CREDENTIALS;
  module.exports.getToken = getToken;
  module.exports.refreshToken = refreshToken;
}