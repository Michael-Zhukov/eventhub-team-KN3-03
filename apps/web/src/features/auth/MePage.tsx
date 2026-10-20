
import { useEffect, useState } from "react";
import {
  getMe,
  logout,
  type AuthUser,
} from "./auth-client";

export function MePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const profile = await getMe();

        if (!active) return;

        if (!profile) {
          window.location.replace("/login");
          return;
        }

        setUser(profile);
      } catch {
        if (active) {
          setError("Не вдалося завантажити профіль.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await logout();
      window.location.replace("/login");
    } catch {
      setError("Не вдалося завершити вихід. Спробуйте ще раз.");
      setLoggingOut(false);
    }
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1>EventHub</h1>
        <p className="page__subtitle">Мій профіль</p>
      </header>

      {loading && <p>Завантажуємо профіль...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && user && (
        <section>
          <h2>Дані користувача</h2>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Роль:</strong> {user.role}
          </p>

          <p>
            <strong>ID:</strong> {user.id}
          </p>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Виходимо..." : "Вийти з акаунта"}
          </button>
        </section>
      )}

      <p>
        <a href="/">Повернутися до каталогу подій</a>
      </p>
    </main>
  );
}
