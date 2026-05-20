import { useState } from "react";

import { Message } from "../../components/common/Message";
import { loginAdmin } from "../../services/api";

export function LoginPage({ onBack, onLogin }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  async function submit(event) {
    event.preventDefault();
    try {
      await loginAdmin(login, password);
      onLogin();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Login ou senha inválidos.",
      });
    }
  }

  return (
    <section className="card login-card command-login">
      <div className="login-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="section-heading compact-heading login-heading">
        <div>
          <span className="section-kicker">Fiocruz Brasília | NUGB</span>
          <h2>Acesso administrativo</h2>
          <p className="subtitle">
            Entre para acompanhar fila, alterações, financeiro, voos e
            exportações da operação.
          </p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          Voltar
        </button>
      </div>
      <form className="auth-panel simple-login" onSubmit={submit}>
        <div className="login-access-chip">
          <span />
          Ambiente restrito
        </div>
        <div className="form-group full">
          <label>Login</label>
          <input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="form-group full">
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <Message message={message} />
        <div className="actions">
          <button type="submit">Entrar no painel</button>
        </div>
      </form>
    </section>
  );
}
