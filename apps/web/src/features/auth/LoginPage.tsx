
import { useState, type FormEvent } from "react";
import { login } from "./auth-client";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      window.location.assign("/me");
    } catch {
      setError("Не вдалося увійти. Перевірте email і пароль.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1>EventHub</h1>
        <p className="page__subtitle">Вхід до акаунта</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email">Електронна пошта</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="login-password">Пароль</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Входимо..." : "Увійти"}
        </button>
      </form>

      <p>
        <a href="/">Повернутися до каталогу подій</a>
      </p>
    </main>
  );
}
