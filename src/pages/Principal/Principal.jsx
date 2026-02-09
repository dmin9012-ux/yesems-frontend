import React, { useEffect, useState } from "react";
import Menu from "../../components/Menu/Menu";
import TopBar from "../../components/TopBar/TopBar";
import { obtenerCursos } from "../../servicios/cursosService";
import { obtenerProgresoUsuario } from "../../servicios/progresoService";
import { notify } from "../../Util/toast";
import "./PrincipalStyle.css";

const Principal = () => {
  const [cursos, setCursos] = useState([]);
  const [cursosCompletados, setCursosCompletados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let mounted = true;

    const cargarDatos = async () => {
      setCargando(true);

      try {
        // 1️⃣ Cursos
        const cursosFirebase = await obtenerCursos();
        if (!Array.isArray(cursosFirebase)) {
          throw new Error("No se pudieron obtener los cursos.");
        }

        // 2️⃣ Progreso
        const progresoRes = await obtenerProgresoUsuario();
        if (!progresoRes?.ok) {
          throw new Error(progresoRes?.message || "Error al cargar progreso");
        }

        if (mounted) {
          setCursos(cursosFirebase);
          setCursosCompletados(
            progresoRes.data?.cursosCompletados || []
          );
        }
      } catch (err) {
        console.error("❌ Error en Principal:", err);
        notify("error", err.message || "Error al cargar la plataforma");
      } finally {
        if (mounted) setCargando(false);
      }
    };

    cargarDatos();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="principal-container">
      <TopBar />

      <main className="principal-content">
        <header className="principal-header">
          <h1 className="principal-title">Bienvenido a YES EMS</h1>
          <p className="principal-subtitle">
            Explora tus cursos y continúa aprendiendo
          </p>
        </header>

        {cargando ? (
          <div className="loader-container">
            <div className="spinner" />
            <p>Sincronizando tus cursos...</p>
          </div>
        ) : cursos.length > 0 ? (
          <Menu
            cursos={cursos}
            cursosCompletados={cursosCompletados}
          />
        ) : (
          <div className="empty-state">
            <p>No hay cursos disponibles en este momento.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Principal;
