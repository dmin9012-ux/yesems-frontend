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

  /* ===============================
     🔄 Cargar progreso desde backend
  =============================== */
  const cargarProgreso = async () => {
    if (!isAuthenticated || !user || user.rol === "admin") {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await obtenerProgresoUsuario();

      // Adaptar según backend: res.progresos viene del backend
      if (res.ok && Array.isArray(res.progresos)) {
        const progresoObj = {};
        const nivelesObj = {};

        // Mapear cada curso para progresoGlobal y nivelesAprobadosGlobal
        res.progresos.forEach((curso) => {
          progresoObj[curso.cursoId] = curso.leccionesCompletadas || [];
          nivelesObj[curso.cursoId] = curso.nivelesAprobados || [];
        });

        setProgresoGlobal(progresoObj);
        setNivelesAprobadosGlobal(nivelesObj);
        setProgresoCursos(res.progresos); // Array completo para Perfil.jsx
      }
    } catch (error) {
      console.error("❌ Error cargando progreso:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     ➕ Actualizar progreso local (lección)
     ⚡ Ahora sincroniza progresoGlobal y progresoCursos
  =============================== */
  const actualizarProgreso = (cursoId, leccionId) => {
    setProgresoGlobal((prev) => {
      const prevCurso = prev[cursoId] || [];
      if (prevCurso.includes(leccionId)) return prev;

      const nuevoProgresoGlobal = {
        ...prev,
        [cursoId]: [...prevCurso, leccionId],
      };

      // 🔹 Actualizar también progresoCursos
      setProgresoCursos((prevCursos) => {
        const cursoIndex = prevCursos.findIndex((c) => c.cursoId === cursoId);
        if (cursoIndex === -1) return prevCursos;

        const cursoPrev = prevCursos[cursoIndex];
        const lecciones = cursoPrev.leccionesCompletadas || [];

        if (lecciones.includes(leccionId)) return prevCursos;

        const totalLecciones = cursoPrev.totalLecciones || lecciones.length + 1;

        const cursoActualizado = {
          ...cursoPrev,
          leccionesCompletadas: [...lecciones, leccionId],
          completado: lecciones.length + 1 >= totalLecciones,
        };

        const nuevosCursos = [...prevCursos];
        nuevosCursos[cursoIndex] = cursoActualizado;
        return nuevosCursos;
      });

      return nuevoProgresoGlobal;
    });
  };

  /* ===============================
     ✅ Actualizar niveles aprobados localmente
  =============================== */
  const actualizarNivelesAprobados = (cursoId, nivelNumero) => {
    setNivelesAprobadosGlobal((prev) => {
      const prevNiveles = prev[cursoId] || [];
      if (prevNiveles.includes(nivelNumero)) return prev;

      return {
        ...prev,
        [cursoId]: [...prevNiveles, nivelNumero],
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
        actualizarNivelesAprobados,
        recargarProgreso: cargarProgreso,
        loading,
      }}
    >
      {children}
    </ProgresoContext.Provider>
  );
};
