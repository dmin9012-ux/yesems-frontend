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

  // 🔹 CALCULAR NIVELES APROBADOS SEGÚN PROGRESO
  const calcularNivelesAprobados = (progresoObj, cursos) => {
    const nivelesObj = {};

    cursos.forEach((curso) => {
      const cursoId = curso.cursoId;
      const leccionesCompletadas = progresoObj[cursoId] || [];
      const nivelesAprobados = [];

      // Cada nivel
      curso.niveles.forEach((nivel) => {
        const todasLeccionesIds = nivel.lecciones.map(
          (l) => `${cursoId}-n${nivel.numero}-l${l.numero}`
        );

        // Si todas las lecciones del nivel están en progreso
        const completado = todasLeccionesIds.every((lid) =>
          leccionesCompletadas.includes(lid)
        );
        if (completado) nivelesAprobados.push(nivel.numero);
      });

      nivelesObj[cursoId] = nivelesAprobados;
    });

    return nivelesObj;
  };

  // 🔄 CARGAR PROGRESO DESDE BACKEND
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
        const cursosData = res.data; // incluye lecciones y niveles aprobados

        cursosData.forEach((p) => {
          progresoObj[p.cursoId] = p.leccionesCompletadas || [];
        });

        setProgresoGlobal(progresoObj);
        setProgresoCursos(cursosData);

        // 🔑 recalcular niveles aprobados
        const nivelesCalculados = calcularNivelesAprobados(progresoObj, cursosData);
        setNivelesAprobadosGlobal(nivelesCalculados);
      }
    } catch (error) {
      console.error("❌ Error cargando progreso:", error);
    } finally {
      setLoading(false);
    }
  };

  // ➕ ACTUALIZAR LECCIÓN LOCAL Y RECALCULAR NIVELES
  const actualizarProgreso = (cursoId, leccionId) => {
    setProgresoGlobal((prev) => {
      const cursoPrev = prev[cursoId] || [];
      if (!cursoPrev.includes(leccionId)) {
        const nuevoProgreso = {
          ...prev,
          [cursoId]: [...cursoPrev, leccionId],
        };

        // 🔑 recalcular niveles aprobados para este curso
        const cursoData = progresoCursos.find((c) => c.cursoId === cursoId);
        if (cursoData) {
          const nivelesCalculados = calcularNivelesAprobados(nuevoProgreso, [cursoData]);
          setNivelesAprobadosGlobal((prevNiveles) => ({
            ...prevNiveles,
            [cursoId]: nivelesCalculados[cursoId] || [],
          }));
        }

        return nuevoProgreso;
      }
      return prev;
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
        recargarProgreso: cargarProgreso,
        loading,
      }}
    >
      {children}
    </ProgresoContext.Provider>
  );
};
