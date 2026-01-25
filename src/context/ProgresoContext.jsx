import { createContext, useState, useEffect } from "react";
import { obtenerProgresoUsuario } from "../servicios/progresoService";
import { useAuth } from "./AuthContext";

export const ProgresoContext = createContext();

export const ProgresoProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [progresoGlobal, setProgresoGlobal] = useState({});
  const [nivelesAprobadosGlobal, setNivelesAprobadosGlobal] = useState({});
  const [progresoCursos, setProgresoCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================================
     🔄 CARGAR PROGRESO DESDE BACKEND
  ====================================== */
  const cargarProgreso = async () => {
    if (!isAuthenticated || !user || user.rol === "admin") {
      setProgresoGlobal({});
      setNivelesAprobadosGlobal({});
      setProgresoCursos([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await obtenerProgresoUsuario();

      /**
       * Backend:
       * {
       *   ok: true,
       *   progresos: [
       *     { cursoId, leccionesCompletadas, nivelesAprobados }
       *   ]
       * }
       */
      if (res && res.data && res.data.ok && Array.isArray(res.data.progresos)) {
        const progresoObj = {};
        const nivelesObj = {};

        res.data.progresos.forEach((curso) => {
          progresoObj[curso.cursoId] = curso.leccionesCompletadas || [];
          nivelesObj[curso.cursoId] = curso.nivelesAprobados || [];
        });

        setProgresoGlobal(progresoObj);
        setNivelesAprobadosGlobal(nivelesObj);
        setProgresoCursos(res.data.progresos);
      }
    } catch (error) {
      console.error("❌ Error cargando progreso:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================
     ➕ ACTUALIZAR PROGRESO LOCAL (LECCIÓN)
  ====================================== */
  const actualizarProgreso = (cursoId, leccionId) => {
    setProgresoGlobal((prev) => {
      const cursoActual = prev[cursoId] || [];

      if (cursoActual.includes(leccionId)) {
        return prev;
      }

      return {
        ...prev,
        [cursoId]: [...cursoActual, leccionId],
      };
    });
  };

  /* ======================================
     ✅ ACTUALIZAR NIVEL APROBADO (EXAMEN)
  ====================================== */
  const aprobarNivel = (cursoId, nivel) => {
    setNivelesAprobadosGlobal((prev) => {
      const nivelesActuales = prev[cursoId] || [];

      if (nivelesActuales.includes(nivel)) {
        return prev;
      }

      return {
        ...prev,
        [cursoId]: [...nivelesActuales, nivel],
      };
    });
  };

  useEffect(() => {
    cargarProgreso();
  }, [user, isAuthenticated]);

  return (
    <ProgresoContext.Provider
      value={{
        progresoGlobal,
        nivelesAprobadosGlobal,
        progresoCursos,
        actualizarProgreso,
        aprobarNivel,
        recargarProgreso: cargarProgreso,
        loading,
      }}
    >
      {children}
    </ProgresoContext.Provider>
  );
};
