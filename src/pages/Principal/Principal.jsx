import React, { useEffect, useState } from "react";
import Menu from "../../components/Menu/Menu";
import TopBar from "../../components/TopBar/TopBar";
import { obtenerCursos } from "../../servicios/cursosService";
import { obtenerProgresoUsuario } from "../../servicios/progresoService";
import { notify } from "../../Util/toast";
import { BookOpen } from "lucide-react";
import "./PrincipalStyle.css";

const Principal = () => {
  const [cursos, setCursos] = useState([]);
  const [cursosCompletados, setCursosCompletados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let mounted = true;
    const cargarDatos = async () => {
      try {
        const [cursosFirebase, progresoRes] = await Promise.all([
          obtenerCursos(),
          obtenerProgresoUsuario()
        ]);

        if (!Array.isArray(cursosFirebase)) throw new Error("No se pudieron obtener los cursos.");
        if (!progresoRes?.ok) throw new Error(progresoRes?.message || "Error al cargar progreso");

        if (mounted) {
          setCursos(cursosFirebase);
          setCursosCompletados(progresoRes.data?.cursosCompletados || []);
        }
      } catch (err) {
        console.error("❌ Error en Principal:", err);
        notify("error", err.message || "Error al cargar la plataforma");
      } finally {
        if (mounted) setCargando(false);
      }
    };
    cargarDatos();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="principal-container">
      <TopBar />
      <main className="principal-content">
        <header className="principal-header">
          <h1 className="principal-title">Bienvenido a YES EMS</h1>
          <p className="principal-subtitle">
            Explora tus cursos y continúa con tu formación profesional.
          </p>
        </header>

        {cargando ? (
          <div className="loader-container">
            <div className="spinner-main" />
            <p className="loader-text">Sincronizando tus cursos...</p>
          </div>
        ) : cursos.length > 0 ? (
          <div className="menu-wrapper">
             <Menu 
                cursos={cursos} 
                cursosCompletados={cursosCompletados} 
              />
          </div>
        ) : (
          <div className="empty-state-card">
            <BookOpen size={48} />
            <p>No hay cursos disponibles en este momento.</p>
            <span>Vuelve a revisar más tarde para nuevas actualizaciones.</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default Principal;