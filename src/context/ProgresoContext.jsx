import { createContext, useState, useEffect } from "react";
import { obtenerProgresoUsuario } from "../servicios/progresoService";
import { useAuth } from "./AuthContext";

// 🔹 Contexto
export const ProgresoContext = createContext();

// 🔹 Provider
export const ProgresoProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // { cursoId: [leccionIds] }
  const [progresoGlobal, setProgresoGlobal] = useState({});

  // { cursoId: [nivelesAprobados] }
  const [nivelesAprobadosGlobal, setNivelesAprobadosGlobal] = useState({});

  // 📦 Progreso completo desde backend
  const [progresoCursos, setProgresoCursos] = useState([]);

  const [loading, setLoading] = useState(true);

  /* ======================================
     🔄 CARGAR PROGRESO DESDE BACKEND
  ====================================== */
  const cargarProgreso = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (user && user.rol === "admin") {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await obtenerProgresoUsuario();

      if (res.ok && Array.isArray(res.data)) {
        const progresoObj = {};
        const nivelesObj = {};

        res.data.forEach((p) => {
          progresoObj[p.cursoId] = p.leccionesCompletadas || [];
          nivelesObj[p.cursoId] = p.nivelesAprobados || [];
        });

        setProgresoGlobal(progresoObj);
        setNivelesAprobadosGlobal(nivelesObj);
        setProgresoCursos(res.data);
      }
    } catch (error) {
      console.error("❌ Error cargando progreso:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================
     🚀 CARGA INICIAL
  ====================================== */
  useEffect(() => {
    cargarProgreso();
  }, [user, isAuthenticated]);

  /* ======================================
     ➕ ACTUALIZAR LECCIÓN LOCAL
     (NO niveles, NO finalización)
  ====================================== */
  const actualizarProgreso = (cursoId, leccionId) => {
    setProgresoGlobal((prev) => {
      const cursoPrev = prev[cursoId] || [];

      if (!cursoPrev.includes(leccionId)) {
        return {
          ...prev,
          [cursoId]: [...cursoPrev, leccionId],
        };
      }

      return prev;
    });
  };

  return (
    <ProgresoContext.Provider
      value={{
        progresoGlobal,
        nivelesAprobadosGlobal,
        progresoCursos, // ← aquí viene completado, fechaFinalizacion, etc.
        actualizarProgreso,
        recargarProgreso: cargarProgreso,
        loading,
      }}
    >
      {children}
    </ProgresoContext.Provider>
  );
};
