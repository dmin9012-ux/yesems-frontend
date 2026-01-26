import React, { useEffect, useState } from "react";
import TopBarAdmin from "../../../components/TopBarAdmin/TopBarAdmin";
import { obtenerUsuarios } from "../../../servicios/usuarioAdminService";
import { obtenerCursos } from "../../../servicios/cursosService";
import { notify } from "../../../Util/toast";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer
} from "recharts";
import "./ReportesStyle.css";

// Colores unificados con la marca: Azul Profundo, Ámbar, Verde Éxito y Gris Suave
const COLORS = ["#00003f", "#fcb424", "#10b981", "#9ca3af"];

export default function DashboardReportes() {
  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuariosData, cursosData] = await Promise.all([
          obtenerUsuarios(),
          obtenerCursos()
        ]);
        setUsuarios(usuariosData);
        setCursos(cursosData);
      } catch (error) {
        notify("error", "No se pudieron cargar las métricas.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  if (loading) return (
    <div className="admin-loading-container">
      <div className="spinner"></div>
      <p>Generando reportes estadísticos...</p>
    </div>
  );

  // Lógica de métricas
  const totalUsuarios = usuarios.length;
  const activos = usuarios.filter(u => u.estado === "activo").length;
  const inactivos = totalUsuarios - activos;
  const totalAdmins = usuarios.filter(u => u.rol === "admin").length;
  const totalNormales = totalUsuarios - totalAdmins;

  const rolesData = [
    { name: "Admins", value: totalAdmins },
    { name: "Estudiantes", value: totalNormales }
  ];

  const estadoData = [
    { name: "Activos", value: activos },
    { name: "Inactivos", value: inactivos }
  ];

  const metricsCursos = cursos.map(curso => ({
    nombre: curso.nombre.length > 15 ? curso.nombre.substring(0, 12) + "..." : curso.nombre,
    completados: usuarios.filter(u => u.cursosCompletados?.includes(curso.id)).length,
    lecciones: usuarios.reduce((acc, u) => {
      const lv = u.leccionesValidadas?.filter(l => l.startsWith(curso.id)) || [];
      return acc + lv.length;
    }, 0)
  }));

  return (
    <div className="admin-page-layout">
      <TopBarAdmin />
      <div className="reportes-container">
        <header className="reportes-header">
          <h1>Análisis de Plataforma</h1>
          <p>Métricas generales de usuarios y rendimiento de cursos.</p>
        </header>

        {/* Tarjetas de Resumen */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Usuarios</span>
            <span className="stat-value">{totalUsuarios}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Cursos Activos</span>
            <span className="stat-value">{cursos.length}</span>
          </div>
          <div className="stat-card highlight">
            <span className="stat-label">Usuarios Activos</span>
            <span className="stat-value">{activos}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Administradores</span>
            <span className="stat-value">{totalAdmins}</span>
          </div>
        </div>

        <div className="charts-main-grid">
          {/* Gráficas Circulares */}
          <div className="chart-box">
            <h3>Distribución de Roles</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={rolesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {rolesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>Estado de Cuentas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={estadoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {estadoData.map((_, i) => <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de Barras completa */}
          <div className="chart-box wide">
            <h3>Rendimiento por Curso (Completados vs Lecciones)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricsCursos}>
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completados" fill="#fcb424" name="Usuarios Graduados" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lecciones" fill="#00003f" name="Lecciones Vistas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}