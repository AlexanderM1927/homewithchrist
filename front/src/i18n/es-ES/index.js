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
      altImg: 'Versículo del día',
      list: [
        { reference: 'Jeremías 29:11', text: '"Porque yo sé los planes que tengo para vosotros, dice Yahvé, planes de bienestar y no de mal, para daros el fin que esperáis."' },
        { reference: 'Filipenses 4:13', text: '"Todo lo puedo en Cristo que me fortalece."' },
        { reference: 'Salmos 23:1', text: '"Yahvé es mi pastor; nada me faltará."' },
        { reference: 'Isaías 41:10', text: '"No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo."' },
        { reference: 'Proverbios 3:5', text: '"Confía en Yahvé con todo tu corazón, y no te apoyes en tu propia prudencia."' },
        { reference: 'Romanos 8:28', text: '"Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien."' },
        { reference: 'Mateo 11:28', text: '"Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar."' },
        { reference: 'Juan 14:27', text: '"La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da."' },
        { reference: 'Salmos 46:1', text: '"Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones."' },
        { reference: 'Josué 1:9', text: '"Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes."' },
        { reference: '1 Corintios 16:14', text: '"Todas vuestras cosas sean hechas con amor."' },
        { reference: 'Efesios 4:32', text: '"Sed benignos unos con otros, misericordiosos, perdonándoos unos a otros."' },
        { reference: 'Salmos 34:8', text: '"Gustad, y ved que es bueno Yahvé; dichoso el hombre que confía en él."' },
        { reference: '2 Timoteo 1:7', text: '"Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio."' },
        { reference: 'Juan 3:16', text: '"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito."' },
        { reference: 'Romanos 15:13', text: '"Y el Dios de esperanza os llene de todo gozo y paz en el creer."' },
        { reference: 'Salmos 121:2', text: '"Mi socorro viene de Yahvé, que hizo los cielos y la tierra."' },
        { reference: 'Gálatas 6:9', text: '"No nos cansemos, pues, de hacer bien; porque a su tiempo segaremos."' },
        { reference: 'Colosenses 3:23', text: '"Y todo lo que hagáis, hacedlo de corazón, como para el Señor."' },
        { reference: 'Hebreos 11:1', text: '"Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve."' }
      ]
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
    loadTopicsError: 'No se pudieron cargar los temas',
    loadVersesError: 'No se pudieron cargar los versículos',
    saveSuccess: 'Versículo guardado correctamente',
    saveError: 'Error al guardar',
    weightBadge: 'peso: {weight}',
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
      }
    }
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
      'Me siento ansioso y no sé por qué',
      'Necesito orientación espiritual',
      'Tengo un conflicto familiar',
      '¿Qué dice la Biblia sobre el perdón?'
    ]
  }
}
