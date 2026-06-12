export default {
  nav: {
    home: 'Inicio',
    counselor: 'Consejero',
    verse: 'Versículo',
    advisor:  'Consejero',
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
    delete: 'Eliminar',
    deleteConfirmTitle: 'Eliminar entrada',
    deleteConfirmMessage: 'Esta accion no se puede deshacer. ¿Quieres eliminar esta entrada?',
    deleteSuccess: 'Entrada eliminada correctamente',
    deleteError: 'No se pudo eliminar la entrada'
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
        label: 'Entrenar IA',
        desc: 'Agregar y gestionar versículos bíblicos de entrenamiento'
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
    language: 'Idioma'
  },
  profile: {
    title: 'Mi perfil',
    subtitle: 'Edita tu información personal',
    name: 'Nombre',
    email: 'Correo electrónico',
    phone: 'Teléfono / Celular',
    save: 'Guardar cambios',
    required: 'Campo requerido',
    invalidEmail: 'Correo inválido',
    saveSuccess: 'Perfil actualizado correctamente',
    saveError: 'Error al actualizar el perfil'
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
  }
}
