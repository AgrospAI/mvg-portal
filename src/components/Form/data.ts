import { Section } from './types'

const createOptions = (optionsStr: string) =>
  optionsStr.split('/').map((opt) => ({ label: opt.trim(), value: opt.trim() }))

export const FORM_SECTIONS: Section[] = [
  {
    id: 'section_0',
    title: '0. Dimensión empresarial',
    questions: [
      {
        id: 'companyProfile',
        label: '¿Cuál es el perfil o actividad principal de la empresa?',
        description: 'Seleccione la categoría que mejor describa su actividad.',
        type: 'select',
        options: createOptions(
          'Industrial / Servicios / Comercio / Tecnología / Otro'
        )
      },
      {
        id: 'employeeCount',
        label: '¿Cuántos trabajadores tiene la empresa?',
        description: 'Indique el tamaño actual del equipo humano.',
        type: 'number',
        placeholder: 'Ej: 50'
      },
      {
        id: 'employeeAvgAge',
        label: '¿Cuál es la edad media de la plantilla?',
        description: 'Rango de edad promedio del personal.',
        type: 'select',
        options: createOptions('<30 / 30-40 / 41-50 / >50')
      },
      {
        id: 'clientCount',
        label: '¿Con cuántos clientes activos cuentan aproximadamente?',
        description: 'Número total de clientes en cartera activa.',
        type: 'number',
        placeholder: 'Ej: 150'
      },
      {
        id: 'providerCount',
        label: '¿Con cuántos proveedores activos trabajan?',
        description: 'Número total de proveedores recurrentes.',
        type: 'number',
        placeholder: 'Ej: 20'
      },
      {
        id: 'annualRevenue',
        label: '¿Cuál es su facturación bruta anual?',
        description: 'Volumen de ingresos anuales (en € o moneda local).',
        type: 'select',
        options: createOptions('<1M / 1-5M / 5-20M / >20M')
      },
      {
        id: 'outsourcingLevel',
        label: '¿Cuál es su nivel de externalización de TI?',
        description:
          'Grado en el que delegan servicios tecnológicos a terceros.',
        type: 'select',
        options: createOptions('Bajo / Medio / Alto')
      }
    ]
  },
  {
    id: 'section_1',
    title: '1. Infraestructuras y conectividad',
    questions: [
      {
        id: 'remoteWorkPolicy',
        label: '¿Existe una política definida para el teletrabajo?',
        description:
          'Normativa interna sobre el uso aceptable de recursos en remoto.',
        type: 'select',
        options: createOptions('Sí / No / En desarrollo')
      },
      {
        id: 'secureRemoteAccess',
        label: '¿Disponen de mecanismos de acceso remoto seguro?',
        description:
          'Uso de VPNs u otros túneles seguros para conectar desde fuera.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      },
      {
        id: 'twoFactorAuth',
        label: '¿Utilizan verificación de doble factor (2FA)?',
        description:
          'Requerir un segundo código (móvil/app) al iniciar sesión.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      },
      {
        id: 'infrastructureType',
        label: '¿Qué tipo de infraestructura tecnológica predomina?',
        description: 'Dónde se alojan principalmente sus servidores y datos.',
        type: 'select',
        options: createOptions('On-premise / Híbrida / Cloud')
      }
    ]
  },
  {
    id: 'section_2',
    title: '2. Procesos y automatización',
    questions: [
      {
        id: 'digitizedProcessesPct',
        label: '¿Qué porcentaje de sus procesos clave están digitalizados?',
        description: 'Estimación del nivel de automatización interna.',
        type: 'select',
        options: createOptions('0-25% / 26-50% / 51-75% / 76-100%')
      },
      {
        id: 'erpSystem',
        label: '¿Qué software ERP utilizan para la gestión?',
        description:
          'Sistema principal para la planificación de recursos empresariales.',
        type: 'select',
        options: createOptions(
          'SAP / Microsoft / Oracle / Odoo / Otro / Ninguno'
        )
      },
      {
        id: 'crmSystem',
        label: '¿Qué sistema CRM utilizan para gestión de clientes?',
        description:
          'Software para gestionar la relación con clientes y ventas.',
        type: 'select',
        options: createOptions('Salesforce / HubSpot / Zoho / Otro / Ninguno')
      },
      {
        id: 'aiUsage',
        label: '¿Están utilizando Inteligencia Artificial en algún proceso?',
        description:
          'Aplicación de IA para automatizar tareas o analizar datos.',
        type: 'select',
        options: createOptions('No / Explorando / En piloto / En producción')
      }
    ]
  },
  {
    id: 'section_3',
    title: '3. Datos y analítica',
    questions: [
      {
        id: 'dbType',
        label: '¿Qué tipo de base de datos utilizan principalmente?',
        description: 'Infraestructura donde residen sus datos críticos.',
        type: 'select',
        options: createOptions('Cloud (AWS, Google, Azure,...) / OnPremise')
      },
      {
        id: 'reportingTools',
        label: '¿Usan PowerBI u otras herramientas de analítica?',
        description:
          'Tecnologías empleadas para generar cuadros de mando e informes.',
        type: 'select',
        options: createOptions('Power BI / Tableau / Excel / Otro / Ninguno')
      }
    ]
  },
  {
    id: 'section_4',
    title: '4. Personas y cultura digital',
    questions: [
      {
        id: 'advancedDigitalSkills',
        label: '¿Qué % de empleados tiene competencias digitales avanzadas?',
        description: 'Personal con perfil técnico o alta capacidad digital.',
        type: 'select',
        options: createOptions('0-25% / 26-50% / 51-75% / 76-100%')
      },
      {
        id: 'ms365Usage',
        label: '¿Utilizan la suite empresarial Microsoft 365?',
        description: 'Uso corporativo de Office 365, Outlook, etc.',
        type: 'select',
        options: createOptions('Sí / No')
      },
      {
        id: 'collabTools',
        label: '¿Utilizan herramientas colaborativas (Teams, Slack, etc.)?',
        description:
          'Plataformas para facilitar la comunicación interna y el trabajo en equipo.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      },
      {
        id: 'digitalTraining',
        label: '¿Ofrecen formación continua en competencias digitales?',
        description:
          'Programas internos para mejorar las habilidades tecnológicas.',
        type: 'select',
        options: createOptions('Sí / No / Ocasional')
      },
      {
        id: 'securityTraining',
        label: '¿Realizan formación específica en ciberseguridad?',
        description:
          'Cursos o talleres de concienciación en seguridad digital.',
        type: 'select',
        options: createOptions('Sí / No / <1 vez al año')
      },
      {
        id: 'ftfeTraining',
        label: '¿Participan en formaciones bonificadas (Fundae)?',
        description:
          'Uso de créditos de la Fundación Tripartita para formación.',
        type: 'select',
        options: createOptions('Sí / No')
      },
      {
        id: 'phishingTests',
        label: '¿Realizan simulacros o tests de phishing a los empleados?',
        description:
          'Evaluaciones prácticas para medir la resistencia ante ataques.',
        type: 'select',
        options: createOptions('Sí / No / Puntual')
      }
    ]
  },
  {
    id: 'section_5',
    title: '5. Presencia en Internet y redes sociales',
    questions: [
      {
        id: 'internetPresence',
        label: '¿Tienen presencia activa en Internet (web, perfiles)?',
        description: 'Existencia de página web y perfiles actualizados.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      },
      {
        id: 'socialMediaManagement',
        label: '¿Realizan una gestión activa de sus redes sociales?',
        description: 'Publicación y respuesta frecuente a clientes en redes.',
        type: 'select',
        options: createOptions('Sí / No / Ocasional')
      },
      {
        id: 'digitalMarketing',
        label: '¿Invierten en campañas de marketing digital?',
        description: 'Uso de SEO, SEM, Ads o campañas en redes.',
        type: 'select',
        options: createOptions('Sí / No / En evaluación')
      },
      {
        id: 'analyticsUsage',
        label: '¿Analizan el tráfico web y la actividad de los seguidores?',
        description:
          'Uso de herramientas como Google Analytics para medir resultados.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      }
    ]
  },
  {
    id: 'section_6',
    title: '6. Canales de venta online y experiencia del usuario',
    questions: [
      {
        id: 'ecommerce',
        label: '¿Disponen de canales de venta digital (E-commerce)?',
        description: 'Tienda online propia o venta a través de plataformas.',
        type: 'select',
        options: createOptions('Sí / No / En desarrollo')
      },
      {
        id: 'digitalRevenue',
        label: '¿Qué porcentaje de ingresos proviene del canal digital?',
        description: 'Peso de las ventas online sobre el total de facturación.',
        type: 'select',
        options: createOptions('<10% / 10-30% / 30-60% / >60%')
      },
      {
        id: 'commChannelHabitual',
        label: '¿Cuál es el canal habitual de comunicación con el cliente?',
        description: 'El medio que más utilizan actualmente para contactar.',
        type: 'select',
        options: createOptions(
          'Correo / WhatsApp / Teléfono / Portal Cliente / Otro'
        )
      },
      {
        id: 'commChannelPreferred',
        label: '¿Cuál sería su canal preferente de comunicación?',
        description: 'El medio que desearían potenciar en el futuro.',
        type: 'select',
        options: createOptions(
          'Correo / WhatsApp / Teléfono / Portal Cliente / Otro'
        )
      }
    ]
  },
  {
    id: 'section_7',
    title: '7. Ciberseguridad',
    questions: [
      {
        id: 'antivirusName',
        label: '¿Qué software antivirus utilizan los empleados?',
        description: 'Indique el nombre de la solución de seguridad instalada.',
        type: 'text',
        placeholder: 'Ej: Kaspersky, Norton, Defender...'
      },
      {
        id: 'antivirusPct',
        label: '¿Qué porcentaje de empleados tiene antivirus activo?',
        description: 'Cobertura de seguridad en los equipos de la plantilla.',
        type: 'select',
        options: createOptions('0-25% / 26-50% / 51-75% / 76-100%')
      },
      {
        id: 'securityPatches',
        label: '¿Aplican regularmente parches y actualizaciones de seguridad?',
        description: 'Política de mantenimiento y actualización de sistemas.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      },
      {
        id: 'networkControls',
        label: '¿Tienen implementados controles de red (Firewalls, VLANs)?',
        description: 'Medidas de seguridad perimetral y segmentación de red.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      }
    ]
  },
  {
    id: 'section_8',
    title: '8. Gestión de identidades y control de accesos',
    questions: [
      {
        id: 'userManagementProcess',
        label: '¿Existe un proceso formal de alta y baja de usuarios?',
        description:
          'Protocolo documentado para gestionar cuentas de empleados.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      },
      {
        id: 'rolePrivileges',
        label: '¿Se asignan permisos bajo el principio de "mínimo privilegio"?',
        description: 'Los usuarios solo acceden a lo estrictamente necesario.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      }
    ]
  },
  {
    id: 'section_9',
    title: '9. Gestión de incidencias y continuidad de negocio',
    questions: [
      {
        id: 'incidentPlan',
        label: '¿Cuentan con un plan de respuesta a incidentes aprobado?',
        description:
          'Documento que define cómo actuar ante un ciberataque o fallo.',
        type: 'select',
        options: createOptions('Sí / No / En elaboración')
      },
      {
        id: 'bcpDrpPlan',
        label: '¿Disponen de planes de continuidad y recuperación (BCP/DRP)?',
        description:
          'Estrategias para recuperar la operatividad tras un desastre.',
        type: 'select',
        options: createOptions('Sí / No / En desarrollo')
      }
    ]
  },
  {
    id: 'section_10',
    title: '10. Protección de datos y propiedad intelectual',
    questions: [
      {
        id: 'gdprCompliance',
        label: '¿Cumplen formalmente con la normativa de protección de datos?',
        description: 'Adecuación al RGPD, LOPD o normativa local.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      },
      {
        id: 'legalTraining',
        label:
          '¿Forman al personal en aspectos legales y normativos digitales?',
        description: 'Capacitación sobre cumplimiento legal en el entorno IT.',
        type: 'select',
        options: createOptions('Sí / No / Parcial')
      }
    ]
  },
  {
    id: 'section_final',
    title: 'Cierre y Priorización',
    questions: [
      {
        id: 'priorityArea',
        label:
          '¿Cuál considera que es el área prioritaria para su organización?',
        description:
          'Seleccione el ámbito que le gustaría abordar con mayor profundidad.',
        type: 'select',
        options: [
          {
            label: 'Infraestructuras y conectividad',
            value: 'Infraestructuras y conectividad'
          },
          {
            label: 'Procesos y automatización',
            value: 'Procesos y automatización'
          },
          { label: 'Datos y analítica', value: 'Datos y analítica' },
          {
            label: 'Personas y cultura digital',
            value: 'Personas y cultura digital'
          },
          {
            label: 'Presencia en Internet y redes sociales',
            value: 'Presencia en Internet y redes sociales'
          },
          {
            label: 'Canales de venta online y experiencia del usuario',
            value: 'Canales de venta online y experiencia del usuario'
          },
          { label: 'Ciberseguridad', value: 'Ciberseguridad' },
          {
            label: 'Gestión de identidades y control de accesos',
            value: 'Gestión de identidades y control de accesos'
          },
          {
            label: 'Gestión de incidencias y continuidad de negocio',
            value: 'Gestión de incidencias y continuidad de negocio'
          },
          {
            label: 'Protección de datos y propiedad intelectual',
            value: 'Protección de datos y propiedad intelectual'
          }
        ]
      }
    ]
  }
]
