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

// Paleta YES EMS: Azul Profundo, Ámbar, Verde Éxito y Gris Suave
const COLORS = ["#00003f", "#fcb424", "#10b981", "#9ca3af"];

export default function DashboardReportes() {
  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Carga paralela para optimizar tiempos
        const [usuariosData, cursosData] = await Promise.all([
          obtenerUsuarios(),
          obtenerCursos()
        ]);
        setUsuarios(usuariosData);
        setCursos(cursosData);
      } catch (error) {
        console.error("Error al cargar reportes:", error);
        notify("error", "No se pudieron sincronizar las métricas.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  if (loading) return (
    <div className="admin-loading-container">
      <div className="spinner"></div>
      <p>Procesando analíticas de YES EMS...</p>
    </div>
  );

  /* ===============================
     LÓGICA DE PROCESAMIENTO
  =============================== */
  const totalUsuarios = usuarios.length;
  const activos = usuarios.filter(u => u.estado === "activo").length;
  const inactivos = totalUsuarios - activos;
  const totalAdmins = usuarios.filter(u => u.rol === "admin").length;
  const totalEstudiantes = totalUsuarios - totalAdmins;

  const rolesData = [
    { name: "Admins", value: totalAdmins },
    { name: "Estudiantes", value: totalEstudiantes }
  ];

  const estadoData = [
    { name: "Activos", value: activos },
    { name: "Inactivos", value: inactivos }
  ];

  const metricsCursos = cursos.map(curso => ({
    nombre: curso.nombre.length > 12 ? curso.nombre.substring(0, 10) + "..." : curso.nombre,
    graduados: usuarios.filter(u => u.cursosCompletados?.includes(curso.id)).length,
    progreso: usuarios.reduce((acc, u) => {
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
          <p>Métricas de rendimiento y participación estudiantil.</p>
        </header>

        {/* INDICADORES CLAVE (KPIs) */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Usuarios</span>
            <span className="stat-value">{totalUsuarios}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Cursos en Catálogo</span>
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
          {/* DISTRIBUCIÓN POR ROL */}
          <div className="chart-box">
            <h3>Distribución de Roles</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={rolesData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label
                >
                  {rolesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ESTADO DE CUENTAS */}
          <div className="chart-box">
            <h3>Estado de Cuentas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={estadoData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label
                >
                  {estadoData.map((_, i) => <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* RENDIMIENTO POR CURSO */}
          <div className="chart-box wide">
            <h3>Participación por Curso (Graduados vs Lecciones Vistas)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricsCursos}>
                <XAxis dataKey="nombre" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Legend verticalAlign="top" height={36}/>
                <Bar 
                  dataKey="graduados" 
                  fill="#fcb424" 
                  name="Usuarios Graduados" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
                <Bar 
                  dataKey="progreso" 
                  fill="#00003f" 
                  name="Lecciones Validadas" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}