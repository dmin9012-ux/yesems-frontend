import React, { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../../components/TopBarAdmin/TopBarAdmin";
import { notify, confirmDialog } from "../../../../Util/toast"; // 👈 Integración de tus utilidades
import { AlertTriangle, Trash2, ArrowLeft } from "lucide-react";
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
    // Usamos el confirmDialog que configuramos para SweetAlert2
    const result = await confirmDialog(
      `¿Eliminar "${nombre}"?`,
      "Esta acción borrará el curso y todo el progreso de los alumnos vinculados. ¡No se puede deshacer!",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "cursos", id));
        notify("success", "Curso eliminado definitivamente 🗑️");
      } catch (error) {
        console.error("Error al eliminar curso:", error);
        notify("error", "Hubo un error al intentar eliminar el curso.");
      }
    }
  };

  return (
    <div className="admin-page-layout">
      <TopBarAdmin />

      <div className="eliminar-container">
        <header className="eliminar-header">
          <div className="header-title-zone">
            <h1><AlertTriangle color="#dc2626" /> Gestión de Bajas</h1>
            <p>Ten precaución: eliminar un curso es una acción permanente.</p>
          </div>
          <button className="btn-volver-admin" onClick={() => navigate("/admin/cursos")}>
            <ArrowLeft size={18} /> Volver a Cursos
          </button>
        </header>

        {cursos.length === 0 ? (
          <div className="empty-state-admin">
            <p>No se encontraron cursos para gestionar.</p>
          </div>
        ) : (
          <div className="eliminar-grid">
            {cursos.map((curso) => (
              <div className="eliminar-card" key={curso.id}>
                <div className="eliminar-card-content">
                  <h3>{curso.nombre}</h3>
                  <p>{curso.descripcion?.substring(0, 80)}...</p>
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