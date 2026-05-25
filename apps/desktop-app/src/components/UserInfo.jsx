import { useState } from "react";
import user from "../assets/user.png";

export default function UserInfo({
  name = "Nome do Usuario",
  role = "Sem nível",
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="user-info">
      <button
        type="button"
        className="user-avatar"
        onClick={() => setOpen(!open)}
      >
        <img src={user} alt="Usuário" />
      </button>

      {open && (
        <div className="user-modal">
          <div className="user-modal-header">
            <img src={user} alt="Usuário" />
            <div>
              <strong>{name} </strong>
              <span>({role})</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}