import {
    Chart as ChartJS,
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    Title
} from 'chart.js';

ChartJS.register(
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    Title
);

// Configuración global
ChartJS.defaults.font.family = '"Inter", -apple-system, sans-serif';
ChartJS.defaults.color = '#64748B';
ChartJS.defaults.borderColor = 'rgba(241, 245, 249, 0.3)';

// Configuración específica para tipos de gráficos
ChartJS.defaults.elements.bar.backgroundColor = 'rgba(99, 102, 241, 0.8)';
ChartJS.defaults.elements.line.borderWidth = 2;
ChartJS.defaults.elements.point.radius = 4;
ChartJS.defaults.plugins.legend.position = 'top';
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';

// Configuración de animaciones
ChartJS.defaults.animation.duration = 800;

ChartJS.defaults.maintainAspectRatio = false;
ChartJS.defaults.responsive = true;