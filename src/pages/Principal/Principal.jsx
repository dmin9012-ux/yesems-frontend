import React, { useEffect, useState } from "react";
import Menu from "../../components/Menu/Menu";
import TopBar from "../../components/TopBar/TopBar";
import { obtenerCursos } from "../../servicios/cursosService";
import { obtenerProgresoUsuario } from "../../servicios/progresoService";
import { notify } from "../../Util/toast"; // 👈 Tu utilidad de Toasts
import "./PrincipalStyle.css";

const Principal = () => {
  const [cursos, setCursos] = useState([]);
  const [cursosCompletados, setCursosCompletados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);

      try {
        // 🔹 1. Cursos desde Firebase
        const cursosFirebase = await obtenerCursos();

        if (!Array.isArray(cursosFirebase)) {
          throw new Error("No se pudieron obtener los cursos.");
        }

        // 🔹 2. Progreso desde backend
        const progresoRes = await obtenerProgresoUsuario();

        if (!progresoRes.ok) {
          throw new Error(progresoRes.message || "Error al cargar progreso");
        }

        // 🧠 Normalizar progreso (Array de IDs de cursos completados)
        const cursosFinalizados = progresoRes.data?.cursosCompletados || [];

        setCursos(cursosFirebase);
        setCursosCompletados(cursosFinalizados);
      } catch (err) {
        console.error("❌ Error en Principal:", err);
        notify("error", err.message || "Error al cargar la plataforma");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="principal-container">
      <TopBar />
      
      <main className="principal-content">
        <div className="principal-header">
          <h1 className="principal-title">Bienvenido a YES EMS</h1>
          <p className="principal-subtitle">Explora tus cursos y continúa aprendiendo</p>
        </div>

        {cargando ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Sincronizando tus cursos...</p>
          </div>
        ) : (
          <>
            {cursos.length > 0 ? (
              <Menu
                cursos={cursos}
                cursosCompletados={cursosCompletados}
              />
            ) : (
              <div className="empty-state">
                <p>No hay cursos disponibles en este momento.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Principal;