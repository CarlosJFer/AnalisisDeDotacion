/*
  Seed de tabla "Funciones" para Agrupamiento y Niveles.
  Lee un bloque TSV incrustado (Id.\tFunción\tPertenece al agrupamiento) y persiste en MongoDB.
*/

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const ANFunction = require('../models/ANFunction');

const RAW = String(`Id.\tFunción\tPertenece al agrupamiento
1\tIntendente\t-
5\tSecretario de Area\t-
6\tSubsecretario de Area\t-
11\tViceintendente\t-
38\tServicio Asistencial\t-
39\tJuez de Faltas\t-
40\tSecretario de Juzgado\t-
41\tPro Secretario de Juzgado\t-
47\tCoordinador\t-
49\tEncargado de playas\t-
76\tConcejal\t-
77\tSecretario h.c.d.\t-
78\tPro secretario h.c.d.\t-
85\tInterventor caja municipal  de prestamos\t-
92\tCoordinador ejecutivo\t-
93\tCoordinador tecnico\t-
97\tSub Asesor de Asesoría de Gestión\t-
98\tOperario de cuadrilla de limpieza\tSG
58\tOperador de radio\tAC
122\tAgente de guardia urbana\tAC
123\tAtención al ciudadano presencial/telefónica-email-web-redes sociales\tAC
124\tAuditor telefónico\tAC
125\tAuxiliar de seguridad vial escolar\tAC
126\tAuxiliar de trámites de transporte\tAC
127\tCoordinador de atención al ciudadano\tAC
128\tGestores de reclamos y solicitudes(SAC)\tAC
129\tGuía de turismo\tAC
130\tJefe de operaciones(SAC)\tAC
131\tMediador\tAC
132\tPromotor ambiental\tAC
133\tPromotor de actividades artísticas\tAC
134\tPromotor de salud\tAC
135\tPromotor turístico/Informante turístico/Informante Turístico Intinirante\tAC
75\tAuxiliar de Enfermeria\tAI
80\tTécnico en Nutrición\tAI
181\tAgente sanitario\tAI
182\tAsistente religioso\tAI
183\tAuxiliar veterinario\tAI
184\tBioquímico\tAI
185\tConductor de ambulancia\tAI
186\tCoordinador de actividades recreativas\tAI
187\tEcografista\tAI
188\tEnfermero\tAI
189\tGuardavidas\tAI
190\tKinesiólogo\tAI
191\tMédico\tAI
192\tNutricionista\tAI
193\tObstetra\tAI
194\tOdontólogo\tAI
195\tPsicólogo\tAI
196\tPsicopedagogo\tAI
197\tRadiólogo\tAI
198\tTécnico de laboratorio\tAI
199\tTrabajador Social\tAI
200\tVeterinario\tAI
43\tProfesor\tFA
63\tAuxiliar de cocina\tFA
201\tAuxiliar de Sala(CDI)\tFA
202\tBailarín\tFA
203\tCapacitador\tFA
204\tCocinero de CDI\tFA
205\tGestor de programas educativos\tFA
206\tGestor de plataformas educativas\tFA
207\tInstructor de actividades deportivas\tFA
208\tInstructor de arte\tFA
209\tMúsico\tFA
210\tProductor de contenido para capacitaciones\tFA
211\tResponsable de Sala(CDI)\tFA
212\tTécnicos de sonido, montaje e iluminación\tFA
61\tAdministrador\tGG
67\tOrdenanza\tGG
83\tEscribana/o\tGG
84\tEscribana/o adjunta/o\tGG
90\tCoordinador de delegación\tGG
100\tAdministrativo general\tGG
101\tAnalista de cartografía/Certificador catastral, Relevador catastral\tGG
102\tAnalista económico\tGG
103\tAnalista normativo\tGG
104\tAnalista y gestor de programas y proyectos\tGG
105\tAnalista tributario\tGG
106\tAuxiliar de cadetería, mantenimiento y vigilancia\tGG
107\tCeremonial y Protocolo\tGG
108\tEncargado de farmacia\tGG
109\tGestor de Datos Estadísticos\tGG
110\tGestor y coordinador de eventos\tGG
111\tGestor Territorial\tGG
112\tLiquidador de haberes\tGG
113\tLocutor\tGG
114\tMozo\tGG
115\tNotificador\tGG
116\tPlanificador urbano\tGG
117\tSereno\tGG
119\tValuador inmobiliario/Tasador\tGG
120\tVisador catastral/Visador de obras particulares\tGG
121\tVisualizador del COM\tGG
4\tInspector\tIA
17\tJefe de Cuerpo\tIA
50\tAuditor administrativo\tIA
52\tJefe de servicio y operativos especiales\tIA
53\tOficial inspector\tIA
54\tOficial motorista\tIA
55\tInspector examinador práctico\tIA
56\tInspector examinador técnico\tIA
57\tInspector instructor vial\tIA
158\tAuditor contable\tIA
159\tAuditor fiscal\tIA
160\tAuditor de personal\tIA
161\tAuditor médico\tIA
162\tEvaluador de examen práctico de Licencia de conducir\tIA
163\tEvaluador de examen teórico de Licencia de conducir\tIA
164\tEvaluador de examen Psicológico de Licencia de conducir\tIA
165\tExaminador Médico Visual\tIA
166\tInspector de abastecimiento y bromatología\tIA
167\tInspector de comercio\tIA
168\tInspector de espacios reservados/estacionamiento medido\tIA
169\tInspector de higiene urbana\tIA
170\tInspector de Obras\tIA
171\tInspector de Redes Urbanas\tIA
172\tInspector de residuos peligrosos\tIA
173\tInspector de tránsito conductores/motorista\tIA
174\tInspector de tránsito infante\tIA
175\tInspector de SICAM y Fotomultas\tIA
176\tInspector de transporte Alimenticio\tIA
177\tInspector de transporte conductor/motorista\tIA
178\tInspector de transporte infante\tIA
179\tInspector de Vía Pública/Inspector de Obras Particulares\tIA
180\tVerificador de arbolado urbano - Inspector de sanidad vegetal\tIA
213\tDesarrollador de Sistemas de Georeferenciación\tIS
214\tDesarrollador/Programador de software\tIS
215\tSoporte informático(SOFT)\tIS
216\tSoporte técnico(HARD)\tIS
7\tDirector general\tSe utiliza como ejemplo NIVEL: H
10\tJefe de división\tSe utiliza como ejemplo NIVEL: H
9\tJefe de departamento\tSe utiliza como ejemplo NIVEL: I
8\tDirector\tSe utiliza como ejemplo NIVEL: J
44\tDelegado Municipal\tSe utiliza como ejemplo NIVEL: J
3\tOperario\tSG
13\tOperario Calificado\tSG
36\tSupervisor\tSG
87\tJefe de servicio\tSG
89\tMaquinista\tSG
91\tTropero\tSG
118\tTopógrafo\tSG
136\tBarrendero\tSG
137\tCapataz de obra/cuadrilla\tSG
138\tConductor de camiones de recolección\tSG
139\tConductor de maquinaria vial\tSG
140\tConductor de vehículos de uso oficial\tSG
141\tCortador de césped/desmalezador\tSG
142\tFumigador/Operario control  de plagas\tSG
143\tGestor de Mantenimiento\tSG
144\tGuardaparque\tSG
145\tMecánico\tSG
146\tOperario de alumbrado público\tSG
147\tOperario de control de animales en la vía pública\tSG
148\tOperario de mantenimiento de establecimientos y mobiliario urbano\tSG
149\tOperario de mantenimiento vial y pluvial\tSG
150\tOperario de señalización\tSG
151\tPaisajista\tSG
152\tPlacero\tSG
153\tPodador de altura\tSG
154\tRecepcionista/Sepulturero/Inhumador\tSG
155\tRecolector de residuos\tSG
156\tRecolector de residuos diferenciados\tSG
157\tResponsable de depósito\tSG`);

function normalizeGroup(g) {
  if (!g) return '';
  const s = String(g).trim();
  if (!s || s === '-' || s === '—') return '';
  if (/^se utiliza como ejemplo/i.test(s)) return '';
  return s.toLowerCase();
}

async function run() {
  await connectDB();
  const lines = RAW.split(/\r?\n/).filter(Boolean);
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length < 2) continue;
    const id = Number(parts[0]);
    const funcion = (parts[1] || '').trim();
    const agrup = normalizeGroup(parts[2] || '');
    if (!Number.isFinite(id) || !funcion) continue;
    out.push({ functionId: id, funcion, agrupamiento: agrup });
  }
  console.log(`Leídas ${out.length} filas de funciones.`);
  await ANFunction.deleteMany({});
  if (out.length) {
    await ANFunction.insertMany(out, { ordered: false });
  }
  console.log('Funciones importadas.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
