import React, { useEffect, useState } from "react";

import Menu from "../../components/Menu/Menu";
import TopBar from "../../components/TopBar/TopBar";

import { obtenerCursos } from "../../servicios/cursosService";
import { obtenerProgresoUsuario } from "../../servicios/ProgresoService";

import "./PrincipalStyle.css";

const Principal = () => {
  const [cursos, setCursos] = useState([]);
  const [cursosCompletados, setCursosCompletados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError("");

      try {
        // 🔹 1. Cursos desde Firebase
        const cursosFirebase = await obtenerCursos();

        if (!Array.isArray(cursosFirebase)) {
          throw new Error("Cursos inválidos");
        }

        // 🔹 2. Progreso desde backend
        const progresoRes = await obtenerProgresoUsuario();

        console.log("🧪 RESPUESTA COMPLETA progresoRes:", progresoRes);
        console.log("🧪 DATA progresoRes.data:", progresoRes.data);

          if (!progresoRes.ok) {
            throw new Error("Error al cargar progreso");
          }


        // 🧠 Normalizar progreso
        const cursosFinalizados =
          progresoRes.data?.cursosCompletados || [];

        setCursos(cursosFirebase);
        setCursosCompletados(cursosFinalizados);
      } catch (err) {
        console.error("❌ Error en Principal:", err);
        setError("No se pudo cargar la información");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="principal-container">
      <TopBar />

      <h1 className="principal-title">Bienvenido a Yesems</h1>
      <p className="principal-subtitle">Explora los cursos disponibles:</p>

      {cargando && <p>Cargando cursos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!cargando && !error && cursos.length > 0 && (
        <Menu
          cursos={cursos}
          cursosCompletados={cursosCompletados}
        />
      )}

      {!cargando && !error && cursos.length === 0 && (
        <p>No hay cursos disponibles</p>
      )}
    </div>
  );
};

export default Principal;
