
import { EventList } from "./features/catalog/EventList";
import { LoginPage } from "./features/auth/LoginPage";
import { MePage } from "./features/auth/MePage";

export function App() {
  const path = window.location.pathname;

  if (path === "/login") {
    return <LoginPage />;
  }

  if (path === "/me") {
    return <MePage />;
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1>EventHub</h1>
        <p className="page__subtitle">Квитки на події</p>

        <nav aria-label="Навігація">
          <a href="/login">Увійти</a>
          {" | "}
          <a href="/me">Мій профіль</a>
        </nav>
      </header>

      <EventList />
    </main>
  );
}
