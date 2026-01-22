import React, { useEffect, useState } from "react";
import TopBarAdmin from "../../../components/TopBarAdmin/TopBarAdmin";
import { obtenerUsuarios } from "../../../servicios/usuarioAdminService";
import { obtenerCursos } from "../../../servicios/cursosService";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, Legend
} from "recharts";
import "./ReportesStyle.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function DashboardReportes() {
  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      const usuariosData = await obtenerUsuarios();
      const cursosData = await obtenerCursos();
      setUsuarios(usuariosData);
      setCursos(cursosData);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("No se pudieron cargar los reportes. Revisa tu sesión.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (loading) return <div>Cargando reportes...</div>;

  // Métricas de usuarios
  const totalUsuarios = usuarios.length;
  const activos = usuarios.filter(u => u.estado === "activo").length;
  const inactivos = totalUsuarios - activos;
  const totalAdmins = usuarios.filter(u => u.rol === "admin").length;
  const totalUsuariosNormales = totalUsuarios - totalAdmins;

  const rolesData = [
    { name: "Admins", value: totalAdmins },
    { name: "Usuarios", value: totalUsuariosNormales }
  ];

  const estadoData = [
    { name: "Activos", value: activos },
    { name: "Inactivos", value: inactivos }
  ];

  // Métricas de cursos
  const totalCursos = cursos.length;

  // Contar usuarios que completaron cada curso
  const cursosCompletadosPorUsuarios = cursos.map(curso => {
    const totalUsuariosCurso = usuarios.filter(u =>
      u.cursosCompletados.includes(curso.id)
    ).length;

    // Contar lecciones validadas de este curso
    const totalLeccionesValidadas = usuarios.reduce((acc, u) => {
      const leccionesCurso = u.leccionesValidadas.filter(l => l.startsWith(curso.id));
      return acc + leccionesCurso.length;
    }, 0);

    return {
      nombre: curso.nombre,
      usuariosCompletaron: totalUsuariosCurso,
      leccionesValidadas: totalLeccionesValidadas
    };
  });

  return (
    <>
      <TopBarAdmin />
      <div className="dashboard-container">
        <h1>Dashboard de Reportes</h1>

        <div className="cards-container">
          <div className="card">
            <h2>Total Usuarios</h2>
            <p>{totalUsuarios}</p>
          </div>
          <div className="card">
            <h2>Usuarios Activos</h2>
            <p>{activos}</p>
          </div>
          <div className="card">
            <h2>Usuarios Inactivos</h2>
            <p>{inactivos}</p>
          </div>
          <div className="card">
            <h2>Admins</h2>
            <p>{totalAdmins}</p>
          </div>
          <div className="card">
            <h2>Usuarios Normales</h2>
            <p>{totalUsuariosNormales}</p>
          </div>
          <div className="card">
            <h2>Total Cursos</h2>
            <p>{totalCursos}</p>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart">
            <h3>Distribución por Rol</h3>
            <PieChart width={250} height={250}>
              <Pie
                data={rolesData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {rolesData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          <div className="chart">
            <h3>Usuarios por Estado</h3>
            <PieChart width={250} height={250}>
              <Pie
                data={estadoData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#82ca9d"
                label
              >
                {estadoData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        <div className="bar-container">
          <h3>Usuarios que completaron cursos / lecciones validadas</h3>
          <BarChart width={700} height={300} data={cursosCompletadosPorUsuarios}>
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="usuariosCompletaron" fill="#8884d8" name="Usuarios completaron" />
            <Bar dataKey="leccionesValidadas" fill="#82ca9d" name="Lecciones validadas" />
          </BarChart>
        </div>
      </div>
    </>
  );
}
