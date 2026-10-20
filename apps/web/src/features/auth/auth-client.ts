
const AUTH_BASE_URL = "/api/auth";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

// Access-токен зберігаємо тільки в пам'яті.
let accessToken: string | null = null;

// Один спільний запит refresh для всіх одночасних викликів.
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Неправильна електронна пошта або пароль");
  }

  const result = (await response.json()) as AuthResponse;

  accessToken = result.accessToken;

  return result;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/refresh`, {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        accessToken = null;
        return null;
      }

      const result = (await response.json()) as AuthResponse;

      accessToken = result.accessToken;
      return accessToken;
    } catch {
      accessToken = null;
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function getMe(): Promise<AuthUser | null> {
  if (!accessToken) {
    await refreshAccessToken();
  }

  if (!accessToken) {
    return null;
  }

  const requestMe = (token: string) =>
    fetch(`${AUTH_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "same-origin",
    });

  let response = await requestMe(accessToken);

  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      return null;
    }

    response = await requestMe(newToken);
  }

  if (!response.ok) {
    throw new Error("Не вдалося завантажити профіль");
  }

  return (await response.json()) as AuthUser;
}

export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/logout`, {
      method: "POST",
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error("Не вдалося вийти з акаунта");
    }
  } finally {
    accessToken = null;
  }
}
