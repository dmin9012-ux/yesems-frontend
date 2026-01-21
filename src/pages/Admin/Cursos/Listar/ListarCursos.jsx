// src/pages/Admin/Cursos/ListarCursos.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../../components/TopBarAdmin/TopBarAdmin";
import "./ListarCursosStyle.css";

export default function ListarCursos() {
  const [cursos, setCursos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = collection(db, "cursos");
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const arr = [];
        snapshot.forEach((doc) =>
          arr.push({ id: doc.id, ...doc.data() })
        );
        setCursos(arr);
      },
      (error) => {
        console.error("Error cargando cursos:", error);
      }
    );

    return () => unsub();
  }, []);

  return (
    <>
      <TopBarAdmin />

      <div className="listar-page" style={{ marginTop: "80px" }}>
        <h1>Gestión de Cursos</h1>

        {/* PANEL CRUD */}
        <div className="crud-options">
          <button
            className="btn-panel"
            onClick={() => navigate("/admin")}
          >
            ⬅️ Regresar al Panel
          </button>

          <button
            className="btn-crear"
            onClick={() => navigate("/admin/cursos/crear")}
          >
            ➕ Crear Curso
          </button>
        </div>

        {/* LISTA DE CURSOS */}
        <div className="cursos-grid">
          {cursos.map((c) => (
            <div key={c.id} className="curso-card">
              <h3>{c.nombre}</h3>

              {c.imagenURL && (
                <img src={c.imagenURL} alt={c.nombre} />
              )}

              <p>{c.descripcion}</p>

              <div className="card-actions">
                <button
                  onClick={() =>
                    navigate(`/admin/cursos/editar/${c.id}`)
                  }
                >
                  ✏️ Editar
                </button>

                <button
                  onClick={() =>
                    navigate(`/admin/cursos/eliminar/${c.id}`)
                  }
                >
                  🗑 Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
