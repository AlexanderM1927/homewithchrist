export default {
  nav: {
    home: 'Inicio',
    counselor: 'Hope IA',
    verse: 'Versículo',
    advisor:  'Hope IA',
    bible: 'Biblia',
    diary: 'Diario',
    mood: 'Ánimo',
    logout: 'Salir',
    training: 'Entrenar',
    admin: 'Administrar'
  },
  dashboard: {
    greeting: 'Hola,',
    blessing: 'Que Dios bendiga tu día ✨',
    verse: {
      label: '☀️ VERSÍCULO DEL DÍA PARA TÍ',
      altImg: 'Versículo del día'
    },
    streak: {
      label: 'RACHA',
      days: 'días',
      encouragement: '¡Sigue así!'
    },
    mood: {
      label: 'ESTADO DE ÁNIMO',
      value: 'En paz',
      description: 'Hoy me siento agradecida.',
      seeMore: 'Ver más'
    },
    counselor: {
      label: 'CONSEJERO ESPIRITUAL IA',
      question: '¿En qué puedo orar contigo hoy?',
      cta: 'Hablar ahora'
    },
    diary: {
      label: 'ÚLTIMA ENTRADA DEL DIARIO',
      empty: 'No tienes ninguna entrada hasta ahora'
    }
  },
  diary: {
    title: 'Mi diario',
    subtitle: 'Escribe lo que hay en tu corazón y guarda tus reflexiones.',
    entryTitle: 'Título',
    optional: 'Opcional',
    content: 'Contenido',
    contentPlaceholder: 'Escribe aquí tu reflexión...',
    contentRequired: 'El contenido es requerido',
    image: 'Imagen',
    imageHint: 'JPG, JPEG o PNG. Opcional.',
    imageEditHint: 'Selecciona una nueva imagen para reemplazar la actual.',
    imageTooLarge: 'La imagen no puede superar 5 MB',
    imagePreview: 'Vista previa de la imagen',
    save: 'Guardar entrada',
    myEntries: 'Mis entradas',
    seeMore: 'Ver más',
    back: 'Volver',
    entryNotFound: 'No se encontró la entrada',
    empty: 'Aún no tienes entradas. Comienza escribiendo una reflexión.',
    loadError: 'No se pudieron cargar las entradas',
    saveSuccess: 'Entrada guardada correctamente',
    saveError: 'No se pudo guardar la entrada',
    edit: 'Editar',
    cancel: 'Cancelar',
    saveChanges: 'Guardar cambios',
    updateSuccess: 'Entrada actualizada correctamente',
    updateError: 'No se pudo actualizar la entrada',
    share: 'Compartir entrada',
    shareText: 'Revisa esta nota',
    shareCopied: 'Enlace de la entrada copiado',
    shareError: 'No se pudo compartir la entrada',
    delete: 'Eliminar',
    deleteConfirmTitle: 'Eliminar entrada',
    deleteConfirmMessage: 'Esta accion no se puede deshacer. ¿Quieres eliminar esta entrada?',
    deleteSuccess: 'Entrada eliminada correctamente',
    deleteError: 'No se pudo eliminar la entrada'
  },
  sharedDiary: {
    readOnly: 'Solo lectura',
    loading: 'Cargando entrada...',
    notFoundTitle: 'Entrada no disponible',
    notFoundMessage: 'Este enlace no existe o la entrada ya no esta disponible.'
  },
  bible: {
    title: 'Biblia',
    subtitle: 'Lee por libro y capitulo o busca una palabra en los versiculos guardados.',
    version: 'Version',
    book: 'Libro',
    chapter: 'Capitulo',
    search: 'Buscar en la Biblia',
    searchHint: 'Escribe al menos 2 caracteres',
    empty: 'No hay versiculos para esta seleccion.',
    noSearchResults: 'No se encontraron versiculos.',
    resultsFor: 'Resultados para "{query}"',
    loadError: 'No se pudo cargar la Biblia',
    searchError: 'No se pudo realizar la busqueda'
  },
  training: {
    title: 'Entrenamiento de IA',
    subtitle: 'Relaciona versiculos importados con temas para orientar las respuestas de la IA.',
    category: 'Categoría / Tema',
    book: 'Libro',
    chapter: 'Capítulo',
    verseStart: 'Versículo inicio',
    verseEnd: 'Versículo fin',
    reference: 'Referencia',
    version: 'Versión bíblica',
    text: 'Texto del versículo',
    weight: 'Peso / Relevancia',
    weightLow: 'Baja relevancia',
    weightHigh: 'Alta relevancia',
    save: 'Guardar versículo',
    clear: 'Limpiar',
    history: 'Versículos guardados',
    searchPlaceholder: 'Buscar por referencia, tema, libro, versión o texto',
    empty: 'Aún no hay versículos guardados.',
    required: 'Campo requerido',
    topics: 'Temas',
    createdBy: 'Creado por',
    allCreators: 'Todos los usuarios',
    loadTopicsError: 'No se pudieron cargar los temas',
    loadVersesError: 'No se pudieron cargar los versículos',
    saveSuccess: 'Versículo guardado correctamente',
    saveError: 'Error al guardar',
    weightBadge: 'peso: {weight}',
    associate: 'Relacionar seleccionados',
    selectRange: 'Seleccionar rango',
    clearSelection: 'Limpiar seleccion',
    selectedCount: '{count} versiculos seleccionados',
    noChapterVerses: 'Selecciona una version, libro y capitulo para ver los versiculos.',
    actions: 'Acciones',
    editRelation: 'Editar relacion',
    cancel: 'Cancelar',
    saveChanges: 'Guardar cambios',
    updateSuccess: 'Relacion actualizada correctamente',
    updateError: 'No se pudo actualizar la relacion',
    deleteTitle: 'Quitar relacion',
    deleteMessage: 'Quitar {reference} del tema {topic}? El versiculo no se eliminara de la Biblia.',
    deleteSuccess: 'Relacion eliminada correctamente',
    deleteError: 'No se pudo eliminar la relacion',
    categories: {
      oracion: 'Oración',
      perdon: 'Perdón',
      ansiedad: 'Ansiedad',
      relaciones: 'Relaciones',
      culpa: 'Culpa',
      biblia: 'Biblia',
      decision: 'Decisión',
      crisis: 'Crisis'
    }
  },
  tableFilters: {
    search: 'Buscar',
    clear: 'Limpiar filtros'
  },
  admin: {
    title: 'Panel de Administración',
    options: {
      training: {
        label: 'Entrenar IA - Por versículos y temas',
        desc: 'Relacionar versículos bíblicos con temas de entrenamiento'
      },
      trainingReflections: {
        label: 'Entrenar IA - Por reflexiones y temas',
        desc: 'Crear reflexiones aprobadas y relacionarlas con temas'
      },
      users: {
        label: 'Gestionar Usuarios',
        desc: 'Ver y cambiar el rol de los usuarios registrados'
      },
      dailyVerses: {
        label: 'Versículos del día',
        desc: 'Agregar y eliminar versículos mostrados en el inicio'
      }
    }
  },
  trainingReflections: {
    title: 'Entrenar IA - Por reflexiones y temas',
    subtitle: 'Crea reflexiones aprobadas para orientar las respuestas de la IA según cada tema.',
    topic: 'Tema',
    message: 'Reflexión',
    createdBy: 'Creado por',
    allCreators: 'Todos los administradores',
    actions: 'Acciones',
    save: 'Guardar reflexión',
    clear: 'Limpiar',
    history: 'Reflexiones guardadas',
    searchPlaceholder: 'Buscar por tema o contenido',
    empty: 'Aún no hay reflexiones de entrenamiento.',
    required: 'Campo requerido',
    cancel: 'Cancelar',
    update: 'Guardar cambios',
    editTitle: 'Editar reflexión',
    loadError: 'No se pudieron cargar las reflexiones',
    loadTopicsError: 'No se pudieron cargar los temas',
    loadUsersError: 'No se pudieron cargar los administradores',
    saveSuccess: 'Reflexión guardada correctamente',
    saveError: 'Error al guardar la reflexión',
    updateSuccess: 'Reflexión actualizada correctamente',
    updateError: 'Error al actualizar la reflexión',
    deleteTitle: 'Eliminar reflexión',
    deleteMessage: '¿Eliminar esta reflexión de entrenamiento?',
    deleteConfirm: 'Eliminar',
    deleteSuccess: 'Reflexión eliminada correctamente',
    deleteError: 'Error al eliminar la reflexión'
  },
  dailyVerses: {
    title: 'Versículos del día',
    reference: 'Referencia',
    text: 'Texto del versículo',
    createdBy: 'Creado por',
    allCreators: 'Todos los usuarios',
    actions: 'Acciones',
    save: 'Guardar versículo',
    clear: 'Limpiar',
    history: 'Versículos guardados',
    searchPlaceholder: 'Buscar por referencia o texto',
    empty: 'Aún no hay versículos del día.',
    required: 'Campo requerido',
    loadError: 'No se pudieron cargar los versículos del día',
    saveSuccess: 'Versículo del día guardado correctamente',
    saveError: 'Error al guardar',
    deleteTitle: 'Eliminar versículo',
    deleteMessage: '¿Eliminar "{reference}" de los versículos del día?',
    deleteConfirm: 'Eliminar',
    deleteSuccess: 'Versículo eliminado correctamente',
    deleteError: 'Error al eliminar'
  },
  users: {
    title: 'Gestión de Usuarios',
    id: 'ID',
    name: 'Nombre',
    phone: 'Teléfono',
    email: 'Correo',
    role: 'Rol',
    empty: 'No hay usuarios registrados.',
    loadError: 'No se pudieron cargar los usuarios',
    updateSuccess: 'Rol actualizado correctamente',
    updateError: 'Error al actualizar el rol',
    contactUpdateSuccess: 'Contacto actualizado correctamente',
    contactUpdateError: 'Error al actualizar contacto'
  },
  login: {
    subtitle: 'Ingresa tus datos para continuar',
    registerSubtitle: 'Crea tu cuenta para continuar',
    loginTab: 'Ingresar',
    registerTab: 'Registrarme',
    name: 'Nombre',
    nameRequired: 'El nombre es requerido',
    email: 'Correo electronico (opcional)',
    emailHint: 'El correo es importante si algun dia necesitas recuperar tu cuenta.',
    invalidEmail: 'Correo invalido',
    nameMin: 'Mínimo 2 caracteres',
    phone: 'Número de celular',
    phoneRequired: 'El número es requerido',
    phoneInvalid: 'Ingresa un número válido',
    pin: 'Clave (4 dígitos)',
    submit: 'Ingresar',
    registerSubmit: 'Crear cuenta',
    goToRegister: 'Registrarme',
    goToLogin: 'Ingresar',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    error: 'Error al iniciar sesion',
    language: 'Idioma',
    forgotPassword: 'Olvide mi clave',
    biometricCta: 'Ingresar con huella',
    biometricTitle: 'Activar ingreso biometrico',
    biometricPrompt: 'Puedes usar tu huella para volver a entrar en este dispositivo Android.',
    biometricEnable: 'Activar',
    biometricSkip: 'Ahora no',
    biometricEnabled: 'Ingreso biometrico activado',
    biometricError: 'No se pudo completar el ingreso biometrico'
  },
  forgotPassword: {
    title: 'Recuperar clave',
    subtitle: 'Escribe el correo vinculado a tu cuenta y te enviaremos un enlace para crear una nueva clave.',
    email: 'Correo electronico',
    emailRequired: 'El correo es requerido',
    invalidEmail: 'Correo invalido',
    submit: 'Enviar correo de recuperacion',
    success: 'Te enviamos un correo para recuperar tu clave',
    error: 'No se pudo enviar el correo de recuperacion',
    backToLogin: 'Volver al ingreso'
  },
  resetPassword: {
    title: 'Nueva clave',
    subtitle: 'Crea una nueva clave de 4 digitos para ingresar a tu cuenta.',
    newPin: 'Nueva clave',
    confirmPin: 'Confirmar nueva clave',
    save: 'Guardar nueva clave',
    pinInvalid: 'La clave debe tener 4 digitos',
    pinMismatch: 'Las claves no coinciden',
    missingToken: 'El enlace de recuperacion no es valido.',
    saveSuccess: 'Clave actualizada correctamente',
    saveError: 'No se pudo actualizar la clave',
    backToLogin: 'Volver al ingreso'
  },
  profile: {
    title: 'Mi perfil',
    subtitle: 'Edita tu información personal',
    name: 'Nombre',
    email: 'Correo electrónico',
    phone: 'Teléfono / Celular',
    language: 'Idioma',
    save: 'Guardar cambios',
    changePassword: 'Cambiar clave',
    required: 'Campo requerido',
    invalidEmail: 'Correo inválido',
    saveSuccess: 'Perfil actualizado correctamente',
    saveError: 'Error al actualizar el perfil'
  },
  changePassword: {
    title: 'Cambiar clave',
    subtitle: 'Actualiza tu clave de 4 dígitos para proteger tu cuenta',
    currentPin: 'Clave actual',
    newPin: 'Nueva clave',
    confirmPin: 'Confirmar nueva clave',
    save: 'Guardar nueva clave',
    pinInvalid: 'La clave debe tener 4 dígitos',
    samePin: 'La nueva clave debe ser diferente',
    pinMismatch: 'Las claves no coinciden',
    saveSuccess: 'Clave actualizada correctamente',
    saveError: 'No se pudo actualizar la clave'
  },
  advisor: {
    title: 'Hope IA',
    subtitle: 'Consejero Espiritual · siempre disponible',
    historyTitle: 'Tus ultimos chats',
    loadingHistory: 'Cargando historial...',
    emptyHistory: 'Aun no tienes chats guardados.',
    welcomeTitle: 'Hola, soy Hope tu consejero',
    welcomeDesc: 'Estoy aquí para escucharte y acompañarte desde la fe. Puedes contarme lo que tengas en el corazón.',
    inputPlaceholder: 'Escribe tu mensaje...',
    share: 'Compartir chat',
    shareText: 'Revisa esta conversación',
    shareCopied: 'Enlace del chat copiado',
    shareError: 'No se pudo compartir el chat',
    errorMessage: 'Hubo un error al conectar con el consejero. Intenta de nuevo más tarde.',
    unavailableMessage: 'Hope no está disponible ahora mismo. Intenta en un rato 🙏',
    phases: {
      classifying: 'Meditando...',
      searching: 'Buscando referencias bíblicas...',
      generating: 'Organizando ideas...'
    },
    suggestions: [
      'Siento necesidad de Dios',
      'Necesito orientación espiritual',
      'Tengo un conflicto personal y espiritual',
      'Necesito orientación y guía bíblica'
    ]
  },
  sharedChat: {
    readOnly: 'Solo lectura',
    loading: 'Cargando conversación...',
    notFoundTitle: 'Chat no disponible',
    notFoundMessage: 'Este enlace no existe o el chat ya no está disponible.'
  },
  privacyPolicy: {
    title: 'Politica de privacidad',
    back: 'Volver',
    lastUpdated: 'Ultima actualizacion: 17 de junio de 2026',
    sections: {
      responsible: {
        title: 'Responsable',
        paragraphs: [
          { text: 'Esta politica describe como Home With Christ trata la informacion de las personas que usan la aplicacion. Para consultas sobre privacidad puedes escribir a', withEmail: true }
        ],
        items: []
      },
      collectedInfo: {
        title: 'Informacion que podemos recopilar',
        paragraphs: [
          { text: 'Segun las funciones que uses, la aplicacion puede recopilar:' }
        ],
        items: [
          'Datos de cuenta, como nombre, telefono, correo electronico si lo agregas, y credenciales de acceso.',
          'Contenido que escribes en la app, como entradas del diario, reflexiones, mensajes y conversaciones con el asesor espiritual.',
          'Contenido compartido por ti mediante enlaces privados, como chats o entradas del diario que decidas compartir.',
          'Datos tecnicos necesarios para operar la app, como tokens de sesion y notificaciones, registros de errores, fecha de uso, metadatos de solicitudes y diagnosticos de funcionamiento.',
          'Imagenes o archivos que adjuntes voluntariamente en funciones que lo permitan.'
        ]
      },
      usage: {
        title: 'Como usamos la informacion',
        paragraphs: [
          { text: 'Usamos la informacion para:' }
        ],
        items: [
          'Crear y administrar tu cuenta.',
          'Permitir el acceso seguro a la aplicacion.',
          'Guardar y mostrar tus diarios, chats, reflexiones y configuraciones.',
          'Responder a tus mensajes en el asesor espiritual y mejorar la calidad de la experiencia.',
          'Prevenir abuso, proteger la seguridad del servicio y corregir errores tecnicos.',
          'Cumplir obligaciones legales o solicitudes validas de autoridades competentes cuando aplique.'
        ]
      },
      aiProviders: {
        title: 'Inteligencia artificial y proveedores externos',
        paragraphs: [
          { text: 'Algunas funciones pueden enviar el texto que escribes a proveedores de inteligencia artificial para generar respuestas. Evita incluir informacion sensible que no quieras procesar en estas funciones. Tambien podemos usar proveedores de infraestructura, base de datos, alojamiento, correo, notificaciones como Firebase Cloud Messaging o analitica tecnica para operar la aplicacion.' }
        ],
        items: []
      },
      sharing: {
        title: 'Cuando compartimos informacion',
        paragraphs: [
          { text: 'No vendemos tu informacion personal. Podemos compartir informacion solo en estos casos:' }
        ],
        items: [
          'Con proveedores que nos ayudan a operar la aplicacion y procesan datos bajo instrucciones nuestras.',
          'Cuando tu decides compartir un chat o una entrada del diario mediante un enlace privado.',
          'Cuando sea necesario por seguridad, prevencion de fraude, soporte tecnico o cumplimiento legal.'
        ]
      },
      security: {
        title: 'Seguridad',
        paragraphs: [
          { text: 'Aplicamos medidas razonables para proteger la informacion, incluyendo autenticacion, tokens de sesion y controles de acceso. Aun asi, ningun sistema conectado a internet puede garantizar seguridad absoluta.' }
        ],
        items: []
      },
      retention: {
        title: 'Conservacion y eliminacion',
        paragraphs: [
          { text: 'Conservamos la informacion mientras tu cuenta este activa o mientras sea necesaria para prestar el servicio, resolver incidencias, cumplir obligaciones legales o proteger la seguridad de la aplicacion. Puedes solicitar la eliminacion de tus datos escribiendo a', withEmail: true }
        ],
        items: []
      },
      children: {
        title: 'Privacidad de menores',
        paragraphs: [
          { text: 'Home With Christ no esta dirigida especificamente a menores de 13 anos. Si eres padre, madre o tutor y crees que un menor nos proporciono informacion personal sin autorizacion, contactanos para revisar y eliminar la informacion cuando corresponda.' }
        ],
        items: []
      },
      rights: {
        title: 'Tus derechos',
        paragraphs: [
          { text: 'Puedes solicitar acceso, correccion o eliminacion de tu informacion personal. Tambien puedes pedir aclaraciones sobre el tratamiento de tus datos escribiendo al correo de contacto indicado en esta politica.' }
        ],
        items: []
      },
      changes: {
        title: 'Cambios a esta politica',
        paragraphs: [
          { text: 'Podemos actualizar esta politica para reflejar cambios en la aplicacion, en proveedores o en requisitos legales. Publicaremos la version vigente en esta pagina e indicaremos la fecha de ultima actualizacion.' }
        ],
        items: []
      }
    }
  },
  terms: {
    title: 'Terminos de uso',
    back: 'Volver',
    lastUpdated: 'Ultima actualizacion: 16 de junio de 2026',
    sections: {
      acceptance: {
        title: 'Aceptacion de los terminos',
        paragraphs: [
          'Al usar Home With Christ aceptas estos terminos. Si no estas de acuerdo, no debes usar la aplicacion.'
        ],
        items: []
      },
      account: {
        title: 'Cuenta y acceso',
        paragraphs: [
          'Eres responsable de mantener la confidencialidad de tus credenciales y de la actividad realizada desde tu cuenta.'
        ],
        items: [
          'Debes proporcionar informacion correcta al registrarte.',
          'No debes compartir tu acceso con personas no autorizadas.',
          'Puedes solicitar soporte o eliminacion de datos desde la pagina de contacto.'
        ]
      },
      use: {
        title: 'Uso permitido',
        paragraphs: [
          'La aplicacion esta pensada para reflexion personal, lectura biblica, diario espiritual y acompanamiento conversacional.'
        ],
        items: [
          'No debes usar la app para acosar, danar, vulnerar sistemas o infringir derechos de terceros.',
          'No debes intentar extraer, copiar o abusar de los servicios internos de la aplicacion.',
          'No debes publicar ni compartir contenido ilegal mediante enlaces de la app.'
        ]
      },
      ai: {
        title: 'Respuestas de inteligencia artificial',
        paragraphs: [
          'Las respuestas generadas por el asesor espiritual pueden contener errores o no ajustarse a tu situacion particular. No sustituyen consejo profesional, medico, legal, financiero, psicologico o pastoral presencial.'
        ],
        items: []
      },
      content: {
        title: 'Tu contenido',
        paragraphs: [
          'Tu mantienes la responsabilidad sobre el contenido que escribes, guardas o compartes. Al usar funciones como diario, chats y enlaces compartidos, autorizas a la aplicacion a procesar ese contenido para prestar el servicio.'
        ],
        items: []
      },
      availability: {
        title: 'Disponibilidad del servicio',
        paragraphs: [
          'Intentamos mantener la aplicacion disponible y funcionando correctamente, pero pueden existir interrupciones, errores, mantenimiento o cambios en las funciones.'
        ],
        items: []
      },
      changes: {
        title: 'Cambios',
        paragraphs: [
          'Podemos actualizar estos terminos cuando cambie la aplicacion, la operacion del servicio o los requisitos legales. La version vigente estara publicada en esta pagina.'
        ],
        items: []
      },
      contact: {
        title: 'Contacto',
        paragraphs: [
          'Para preguntas sobre estos terminos, soporte o solicitudes relacionadas con tu cuenta, visita la pagina de contacto.'
        ],
        items: []
      }
    }
  },
  contact: {
    title: 'Contacto',
    back: 'Volver',
    subtitle: 'Estamos disponibles para preguntas sobre soporte, privacidad, cuenta o funcionamiento de Home With Christ.',
    email: {
      title: 'Correo de contacto',
      description: 'Usa este correo para soporte, solicitudes de privacidad o consultas generales.',
      value: 'hwc@alexanderm.co'
    },
    support: {
      title: 'Soporte',
      description: 'Describe el problema, el telefono de tu cuenta si aplica y los pasos para reproducirlo.',
      value: 'Respondemos tan pronto como sea posible.'
    },
    privacy: {
      title: 'Privacidad',
      description: 'Tambien puedes revisar como tratamos la informacion dentro de la aplicacion.',
      value: 'Ver politica de privacidad'
    }
  },
  welcome: {
    login: 'Iniciar sesión',
    createAccount: 'Crear cuenta',
    limitTitle: 'Continúa tu conversación',
    limitMessage: 'Ya usaste tu mensaje de prueba. Inicia sesión o crea una cuenta para seguir hablando con Hope y guardar tus conversaciones.'
  }
}
