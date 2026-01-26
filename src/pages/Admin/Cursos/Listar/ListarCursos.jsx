import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../../components/TopBarAdmin/TopBarAdmin";
import { Plus, LayoutGrid, Edit, Trash2, ArrowLeft } from "lucide-react"; // Iconos más modernos
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
    <div className="admin-page-layout">
      <TopBarAdmin />

      <div className="listar-cursos-container">
        <header className="admin-header">
          <div className="header-info">
            <h1><LayoutGrid size={28} /> Gestión de Cursos</h1>
            <p>Organiza, edita y publica el contenido educativo de YES EMS.</p>
          </div>

          <div className="admin-actions">
            <button className="btn-secondary" onClick={() => navigate("/admin")}>
              <ArrowLeft size={18} /> Panel Admin
            </button>
            <button className="btn-primary" onClick={() => navigate("/admin/cursos/crear")}>
              <Plus size={18} /> Crear Curso
            </button>
          </div>
        </header>

        {cursos.length === 0 ? (
          <div className="empty-state">
            <p>No hay cursos registrados. Comienza creando uno nuevo.</p>
          </div>
        ) : (
          <div className="admin-cursos-grid">
            {cursos.map((c) => (
              <div key={c.id} className="admin-curso-card">
                <div className="card-image-wrapper">
                  {c.imagenURL ? (
                    <img src={c.imagenURL} alt={c.nombre} />
                  ) : (
                    <div className="image-placeholder">Sin imagen</div>
                  )}
                  <div className="card-overlay">
                     <span className="badge-niveles">
                        {c.niveles?.length || 0} Niveles
                     </span>
                  </div>
                </div>

                <div className="card-body">
                  <h3>{c.nombre}</h3>
                  <p>{c.descripcion?.substring(0, 100)}...</p>
                  
                  <div className="card-footer">
                    <button 
                      className="btn-edit" 
                      onClick={() => navigate(`/admin/cursos/editar/${c.id}`)}
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => navigate(`/admin/cursos/eliminar/${c.id}`)}
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}