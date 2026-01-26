// src/pages/Admin/Cursos/Eliminar/EliminarCurso.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { notify, confirmDialog } from "../../../../Util/toast"; // 👈 Integrando tus utilidades
import { Trash2, AlertTriangle, ArrowLeft } from "lucide-react"; // Iconos profesionales
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
    // Fusión: Usamos tu lógica de validación pero con el confirmDialog premium
    const result = await confirmDialog(
      `¿Seguro que deseas eliminar el curso "${nombre}"?`,
      "Esta acción borrará permanentemente el curso y no se puede deshacer.",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "cursos", id));
        notify("success", "Curso eliminado correctamente ✅");
      } catch (error) {
        console.error("Error al eliminar curso:", error);
        notify("error", "No se pudo eliminar el curso. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="admin-page-layout">
      <TopBarAdmin />

      <div className="eliminar-container">
        {/* HEADER FUSIONADO */}
        <header className="eliminar-header">
          <div className="header-title-zone">
            <h1><AlertTriangle size={32} color="#dc2626" /> Gestión de Bajas</h1>
            <p>Ten precaución: las eliminaciones son definitivas e irreversibles.</p>
          </div>
          <button
            className="btn-volver-admin"
            onClick={() => navigate("/admin/cursos")}
          >
            <ArrowLeft size={18} /> Volver a Cursos
          </button>
        </header>

        {cursos.length === 0 ? (
          <div className="empty-state-admin">
            <p>No hay cursos registrados para eliminar.</p>
          </div>
        ) : (
          <div className="eliminar-grid">
            {cursos.map((curso) => (
              <div className="eliminar-card" key={curso.id}>
                <div className="eliminar-card-content">
                  <h3>{curso.nombre}</h3>
                  {curso.descripcion && (
                    <p className="curso-desc">
                        {curso.descripcion.substring(0, 100)}...
                    </p>
                  )}
                </div>

                <button
                  className="btn-danger-action"
                  onClick={() => eliminar(curso.id, curso.nombre)}
                >
                  <Trash2 size={18} /> Eliminar Curso
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}