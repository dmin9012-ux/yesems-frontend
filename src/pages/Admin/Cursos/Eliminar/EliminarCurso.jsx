// src/pages/Admin/Cursos/Eliminar/EliminarCurso.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../../components/TopBarAdmin/TopBarAdmin";
import "./EliminarCursoStyle.css";

export default function EliminarCurso() {
  const [cursos, setCursos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cursos"), (snap) => {
      setCursos(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  const eliminar = async (id, nombre) => {
    const ok = window.confirm(
      `⚠️ ¿Seguro que deseas eliminar el curso "${nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "cursos", id));
      alert("✅ Curso eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar curso:", error);
      alert("❌ Error al eliminar el curso");
    }
  };

  return (
    <>
      <TopBarAdmin />

      <div className="eliminar-container" style={{ marginTop: "80px" }}>
        {/* HEADER */}
        <div className="eliminar-header">
          <h2>Eliminar Curso</h2>
          <button
            className="btn-volver"
            onClick={() => navigate("/admin/cursos")}
          >
            ← Volver a Cursos
          </button>
        </div>

        {cursos.length === 0 ? (
          <p className="empty-text">No hay cursos registrados.</p>
        ) : (
          <div className="cards-grid">
            {cursos.map((curso) => (
              <div className="curso-card" key={curso.id}>
                <h3>{curso.nombre}</h3>

                {curso.descripcion && (
                  <p className="curso-desc">{curso.descripcion}</p>
                )}

                <button
                  className="btn-delete"
                  onClick={() => eliminar(curso.id, curso.nombre)}
                >
                  Eliminar Curso
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
