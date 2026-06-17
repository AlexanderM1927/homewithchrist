export default {
  nav: {
    home: 'Home',
    counselor: 'Counselor',
    verse: 'Verse',
    advisor:  'Counselor',
    bible: 'Bible',
    diary: 'Diary',
    mood: 'Mood',
    logout: 'Logout',
    training: 'Training',
    admin: 'Admin'
  },
  dashboard: {
    greeting: 'Good morning,',
    blessing: 'May God bless your day ✨',
    verse: {
      label: '☀️ VERSE OF THE DAY',
      altImg: 'Verse of the day',
      list: [
        { reference: 'Jeremiah 29:11', text: '"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."' },
        { reference: 'Philippians 4:13', text: '"I can do all things through Christ who strengthens me."' },
        { reference: 'Psalm 23:1', text: '"The Lord is my shepherd; I shall not want."' },
        { reference: 'Isaiah 41:10', text: '"Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you."' },
        { reference: 'Proverbs 3:5', text: '"Trust in the Lord with all your heart, and do not lean on your own understanding."' },
        { reference: 'Romans 8:28', text: '"And we know that for those who love God all things work together for good."' },
        { reference: 'Matthew 11:28', text: '"Come to me, all who labor and are heavy laden, and I will give you rest."' },
        { reference: 'John 14:27', text: '"Peace I leave with you; my peace I give to you. Not as the world gives do I give to you."' },
        { reference: 'Psalm 46:1', text: '"God is our refuge and strength, a very present help in trouble."' },
        { reference: 'Joshua 1:9', text: '"Be strong and courageous. Do not be frightened, and do not be dismayed."' },
        { reference: '1 Corinthians 16:14', text: '"Let all that you do be done in love."' },
        { reference: 'Ephesians 4:32', text: '"Be kind to one another, tenderhearted, forgiving one another."' },
        { reference: 'Psalm 34:8', text: '"Oh, taste and see that the Lord is good! Blessed is the man who takes refuge in him."' },
        { reference: '2 Timothy 1:7', text: '"For God gave us a spirit not of fear but of power and love and self-control."' },
        { reference: 'John 3:16', text: '"For God so loved the world, that he gave his only Son."' },
        { reference: 'Romans 15:13', text: '"May the God of hope fill you with all joy and peace in believing."' },
        { reference: 'Psalm 121:2', text: '"My help comes from the Lord, who made heaven and earth."' },
        { reference: 'Galatians 6:9', text: '"And let us not grow weary of doing good, for in due season we will reap."' },
        { reference: 'Colossians 3:23', text: '"Whatever you do, work heartily, as for the Lord and not for men."' },
        { reference: 'Hebrews 11:1', text: '"Now faith is the assurance of things hoped for, the conviction of things not seen."' }
      ]
    },
    streak: {
      label: 'STREAK',
      days: 'days',
      encouragement: 'Keep it up!'
    },
    mood: {
      label: 'MOOD',
      value: 'At peace',
      description: 'Today I feel grateful.',
      seeMore: 'See more'
    },
    counselor: {
      label: 'AI SPIRITUAL COUNSELOR',
      question: 'What can I pray with you about today?',
      cta: 'Talk now'
    },
    diary: {
      label: 'LAST DIARY ENTRY',
      empty: 'You do not have any entries yet'
    }
  },
  diary: {
    title: 'My diary',
    subtitle: 'Write what is on your heart and save your reflections.',
    entryTitle: 'Title',
    optional: 'Optional',
    content: 'Content',
    contentPlaceholder: 'Write your reflection here...',
    contentRequired: 'Content is required',
    image: 'Image',
    imageHint: 'JPG, JPEG or PNG. Optional.',
    imageEditHint: 'Select a new image to replace the current one.',
    imageTooLarge: 'The image cannot be larger than 5 MB',
    imagePreview: 'Image preview',
    save: 'Save entry',
    myEntries: 'My entries',
    seeMore: 'See more',
    back: 'Back',
    entryNotFound: 'Entry not found',
    empty: 'You have no entries yet. Start by writing a reflection.',
    loadError: 'Could not load diary entries',
    saveSuccess: 'Entry saved successfully',
    saveError: 'Could not save entry',
    edit: 'Edit',
    cancel: 'Cancel',
    saveChanges: 'Save changes',
    updateSuccess: 'Entry updated successfully',
    updateError: 'Could not update entry',
    share: 'Share entry',
    shareText: 'Check out this note',
    shareCopied: 'Entry link copied',
    shareError: 'The entry could not be shared',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete entry',
    deleteConfirmMessage: 'This action cannot be undone. Do you want to delete this entry?',
    deleteSuccess: 'Entry deleted successfully',
    deleteError: 'Could not delete entry'
  },
  sharedDiary: {
    readOnly: 'Read only',
    loading: 'Loading entry...',
    notFoundTitle: 'Entry unavailable',
    notFoundMessage: 'This link does not exist or the entry is no longer available.'
  },
  bible: {
    title: 'Bible',
    subtitle: 'Read by book and chapter or search a word in the saved verses.',
    version: 'Version',
    book: 'Book',
    chapter: 'Chapter',
    search: 'Search the Bible',
    searchHint: 'Type at least 2 characters',
    empty: 'There are no verses for this selection.',
    noSearchResults: 'No verses found.',
    resultsFor: 'Results for "{query}"',
    loadError: 'Could not load the Bible',
    searchError: 'Could not complete the search'
  },
  training: {
    title: 'AI Training',
    subtitle: 'Link imported verses to topics to guide AI responses.',
    category: 'Category / Topic',
    book: 'Book',
    chapter: 'Chapter',
    verseStart: 'Start verse',
    verseEnd: 'End verse',
    reference: 'Reference',
    version: 'Bible version',
    text: 'Verse text',
    weight: 'Weight / Relevance',
    weightLow: 'Low relevance',
    weightHigh: 'High relevance',
    save: 'Save verse',
    clear: 'Clear',
    history: 'Saved verses',
    searchPlaceholder: 'Search by reference, topic, book, version, or text',
    empty: 'No verses saved yet.',
    required: 'Required field',
    topics: 'Topics',
    createdBy: 'Created by',
    allCreators: 'All users',
    loadTopicsError: 'Could not load topics',
    loadVersesError: 'Could not load verses',
    saveSuccess: 'Verse saved successfully',
    saveError: 'Error saving',
    weightBadge: 'weight: {weight}',
    associate: 'Link selected verses',
    selectRange: 'Select range',
    clearSelection: 'Clear selection',
    selectedCount: '{count} verses selected',
    noChapterVerses: 'Select a version, book, and chapter to view verses.',
    actions: 'Actions',
    editRelation: 'Edit relationship',
    cancel: 'Cancel',
    saveChanges: 'Save changes',
    updateSuccess: 'Relationship updated successfully',
    updateError: 'Could not update the relationship',
    deleteTitle: 'Remove relationship',
    deleteMessage: 'Remove {reference} from topic {topic}? The Bible verse will not be deleted.',
    deleteSuccess: 'Relationship removed successfully',
    deleteError: 'Could not remove the relationship',
    categories: {
      oracion: 'Prayer',
      perdon: 'Forgiveness',
      ansiedad: 'Anxiety',
      relaciones: 'Relationships',
      culpa: 'Guilt',
      biblia: 'Bible',
      decision: 'Decision',
      crisis: 'Crisis'
    }
  },
  tableFilters: {
    search: 'Search',
    clear: 'Clear filters'
  },
  admin: {
    title: 'Administration Panel',
    options: {
      training: {
        label: 'Train AI - By verses and topics',
        desc: 'Link Bible verses to training topics'
      },
      trainingReflections: {
        label: 'Train AI - By reflections and topics',
        desc: 'Create approved reflections and link them to topics'
      },
      users: {
        label: 'Manage Users',
        desc: 'View and change roles for registered users'
      },
      dailyVerses: {
        label: 'Daily verses',
        desc: 'Add and delete verses shown on the home screen'
      }
    }
  },
  trainingReflections: {
    title: 'Train AI - By reflections and topics',
    subtitle: 'Create approved reflections to guide AI responses for each topic.',
    topic: 'Topic',
    message: 'Reflection',
    createdBy: 'Created by',
    allCreators: 'All administrators',
    actions: 'Actions',
    save: 'Save reflection',
    clear: 'Clear',
    history: 'Saved reflections',
    searchPlaceholder: 'Search by topic or content',
    empty: 'No training reflections yet.',
    required: 'Required field',
    cancel: 'Cancel',
    update: 'Save changes',
    editTitle: 'Edit reflection',
    loadError: 'Could not load reflections',
    loadTopicsError: 'Could not load topics',
    loadUsersError: 'Could not load administrators',
    saveSuccess: 'Reflection saved successfully',
    saveError: 'Error saving reflection',
    updateSuccess: 'Reflection updated successfully',
    updateError: 'Error updating reflection',
    deleteTitle: 'Delete reflection',
    deleteMessage: 'Delete this training reflection?',
    deleteConfirm: 'Delete',
    deleteSuccess: 'Reflection deleted successfully',
    deleteError: 'Error deleting reflection'
  },
  dailyVerses: {
    title: 'Daily verses',
    reference: 'Reference',
    text: 'Verse text',
    createdBy: 'Created by',
    allCreators: 'All users',
    actions: 'Actions',
    save: 'Save verse',
    clear: 'Clear',
    history: 'Saved verses',
    searchPlaceholder: 'Search by reference or text',
    empty: 'No daily verses saved yet.',
    required: 'Required field',
    loadError: 'Could not load daily verses',
    saveSuccess: 'Daily verse saved successfully',
    saveError: 'Error saving',
    deleteTitle: 'Delete verse',
    deleteMessage: 'Delete "{reference}" from daily verses?',
    deleteConfirm: 'Delete',
    deleteSuccess: 'Verse deleted successfully',
    deleteError: 'Error deleting'
  },
  users: {
    title: 'User Management',
    id: 'ID',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    role: 'Role',
    empty: 'No registered users.',
    loadError: 'Could not load users',
    updateSuccess: 'Role updated successfully',
    updateError: 'Error updating role',
    contactUpdateSuccess: 'Contact updated successfully',
    contactUpdateError: 'Error updating contact'
  },
  login: {
    subtitle: 'Enter your details to continue',
    registerSubtitle: 'Create your account to continue',
    loginTab: 'Sign in',
    registerTab: 'Register',
    name: 'Name',
    nameRequired: 'Name is required',
    nameMin: 'Minimum 2 characters',
    email: 'Email (optional)',
    emailHint: 'Email is important if you ever need to recover your account.',
    invalidEmail: 'Invalid email',
    phone: 'Phone number',
    phoneRequired: 'Phone number is required',
    phoneInvalid: 'Enter a valid phone number',
    pin: 'PIN (4 digits)',
    submit: 'Sign In',
    registerSubmit: 'Create account',
    goToRegister: 'Register',
    goToLogin: 'Sign in',
    noAccount: 'Do not have an account?',
    hasAccount: 'Already have an account?',
    error: 'Error signing in',
    language: 'Language',
    forgotPassword: 'Forgot my PIN',
    biometricCta: 'Sign in with fingerprint',
    biometricTitle: 'Enable biometric sign-in',
    biometricPrompt: 'You can use your fingerprint to sign in again on this Android device.',
    biometricEnable: 'Enable',
    biometricSkip: 'Not now',
    biometricEnabled: 'Biometric sign-in enabled',
    biometricError: 'Biometric sign-in could not be completed'
  },
  forgotPassword: {
    title: 'Recover PIN',
    subtitle: 'Enter the email linked to your account and we will send you a link to create a new PIN.',
    email: 'Email',
    emailRequired: 'Email is required',
    invalidEmail: 'Invalid email',
    submit: 'Send recovery email',
    success: 'We sent you an email to recover your PIN',
    error: 'Could not send the recovery email',
    backToLogin: 'Back to sign in'
  },
  resetPassword: {
    title: 'New PIN',
    subtitle: 'Create a new 4-digit PIN to access your account.',
    newPin: 'New PIN',
    confirmPin: 'Confirm new PIN',
    save: 'Save new PIN',
    pinInvalid: 'PIN must be 4 digits',
    pinMismatch: 'PINs do not match',
    missingToken: 'The recovery link is not valid.',
    saveSuccess: 'PIN updated successfully',
    saveError: 'Could not update PIN',
    backToLogin: 'Back to sign in'
  },
  profile: {
    title: 'My Profile',
    subtitle: 'Edit your personal information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone / Mobile',
    language: 'Language',
    save: 'Save changes',
    changePassword: 'Change password',
    required: 'Required field',
    invalidEmail: 'Invalid email',
    saveSuccess: 'Profile updated successfully',
    saveError: 'Error updating profile'
  },
  changePassword: {
    title: 'Change password',
    subtitle: 'Update your 4-digit PIN to protect your account',
    currentPin: 'Current PIN',
    newPin: 'New PIN',
    confirmPin: 'Confirm new PIN',
    save: 'Save new PIN',
    pinInvalid: 'PIN must be 4 digits',
    samePin: 'The new PIN must be different',
    pinMismatch: 'PINs do not match',
    saveSuccess: 'PIN updated successfully',
    saveError: 'Could not update PIN'
  },
  advisor: {
    title: 'Hope AI',
    subtitle: 'Spiritual Counselor · always available',
    historyTitle: 'Your latest chats',
    loadingHistory: 'Loading history...',
    emptyHistory: 'You do not have saved chats yet.',
    welcomeTitle: 'Hello, I am Hope your counselor',
    welcomeDesc: 'I am here to listen to you and accompany you in faith. You can share whatever is on your heart.',
    inputPlaceholder: 'Type your message...',
    share: 'Share chat',
    shareText: 'Check out this conversation',
    shareCopied: 'Chat link copied',
    shareError: 'The chat could not be shared',
    errorMessage: 'There was an error connecting to the counselor. Please try again later.',
    unavailableMessage: 'Hope is not available right now. Please try again in a moment 🙏',
    phases: {
      classifying: 'Classifying your question...',
      searching: 'Searching biblical references...',
      generating: 'Generating response...'
    },
    suggestions: [
      'I feel anxious and I don\'t know why',
      'I need spiritual guidance',
      'I have a family conflict',
      'What does the Bible say about forgiveness?'
    ]
  },
  sharedChat: {
    readOnly: 'Read only',
    loading: 'Loading conversation...',
    notFoundTitle: 'Chat unavailable',
    notFoundMessage: 'This link does not exist or the chat is no longer available.'
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    back: 'Back',
    lastUpdated: 'Last updated: June 16, 2026',
    sections: {
      responsible: {
        title: 'Controller',
        paragraphs: [
          { text: 'This policy describes how Home With Christ handles information from people who use the application. For privacy questions, you can write to', withEmail: true }
        ],
        items: []
      },
      collectedInfo: {
        title: 'Information we may collect',
        paragraphs: [
          { text: 'Depending on the features you use, the application may collect:' }
        ],
        items: [
          'Account data, such as your name, phone number, email address if you add it, and access credentials.',
          'Content you write in the app, such as diary entries, reflections, messages, and conversations with the spiritual counselor.',
          'Content you choose to share through private links, such as chats or diary entries.',
          'Technical data needed to operate the app, such as session tokens, error logs, usage dates, request metadata, and performance diagnostics.',
          'Images or files you voluntarily attach in features that allow them.'
        ]
      },
      usage: {
        title: 'How we use information',
        paragraphs: [
          { text: 'We use information to:' }
        ],
        items: [
          'Create and manage your account.',
          'Provide secure access to the application.',
          'Save and display your diaries, chats, reflections, and settings.',
          'Respond to your messages in the spiritual counselor and improve the quality of the experience.',
          'Prevent abuse, protect service security, and fix technical errors.',
          'Comply with legal obligations or valid requests from competent authorities when applicable.'
        ]
      },
      aiProviders: {
        title: 'Artificial intelligence and external providers',
        paragraphs: [
          { text: 'Some features may send the text you write to artificial intelligence providers to generate responses. Avoid including sensitive information that you do not want processed in these features. We may also use infrastructure, database, hosting, email, or technical analytics providers to operate the application.' }
        ],
        items: []
      },
      sharing: {
        title: 'When we share information',
        paragraphs: [
          { text: 'We do not sell your personal information. We may share information only in these cases:' }
        ],
        items: [
          'With providers that help us operate the application and process data under our instructions.',
          'When you choose to share a chat or diary entry through a private link.',
          'When necessary for security, fraud prevention, technical support, or legal compliance.'
        ]
      },
      security: {
        title: 'Security',
        paragraphs: [
          { text: 'We apply reasonable measures to protect information, including authentication, session tokens, and access controls. Even so, no system connected to the internet can guarantee absolute security.' }
        ],
        items: []
      },
      retention: {
        title: 'Retention and deletion',
        paragraphs: [
          { text: 'We retain information while your account is active or while it is necessary to provide the service, resolve incidents, comply with legal obligations, or protect application security. You can request deletion of your data by writing to', withEmail: true }
        ],
        items: []
      },
      children: {
        title: 'Children privacy',
        paragraphs: [
          { text: 'Home With Christ is not specifically directed to children under 13. If you are a parent or guardian and believe that a child provided us personal information without authorization, contact us so we can review and delete the information when appropriate.' }
        ],
        items: []
      },
      rights: {
        title: 'Your rights',
        paragraphs: [
          { text: 'You can request access, correction, or deletion of your personal information. You can also ask questions about how your data is handled by writing to the contact email listed in this policy.' }
        ],
        items: []
      },
      changes: {
        title: 'Changes to this policy',
        paragraphs: [
          { text: 'We may update this policy to reflect changes in the application, providers, or legal requirements. We will publish the current version on this page and indicate the last updated date.' }
        ],
        items: []
      }
    }
  },
  terms: {
    title: 'Terms of Use',
    back: 'Back',
    lastUpdated: 'Last updated: June 16, 2026',
    sections: {
      acceptance: {
        title: 'Acceptance of terms',
        paragraphs: [
          'By using Home With Christ, you accept these terms. If you do not agree, you should not use the application.'
        ],
        items: []
      },
      account: {
        title: 'Account and access',
        paragraphs: [
          'You are responsible for keeping your credentials confidential and for activity performed from your account.'
        ],
        items: [
          'You must provide accurate information when registering.',
          'You must not share your access with unauthorized people.',
          'You can request support or data deletion from the contact page.'
        ]
      },
      use: {
        title: 'Permitted use',
        paragraphs: [
          'The application is intended for personal reflection, Bible reading, spiritual journaling, and conversational accompaniment.'
        ],
        items: [
          'You must not use the app to harass, harm, compromise systems, or infringe third-party rights.',
          'You must not attempt to extract, copy, or abuse the internal services of the application.',
          'You must not publish or share illegal content through app links.'
        ]
      },
      ai: {
        title: 'Artificial intelligence responses',
        paragraphs: [
          'Responses generated by the spiritual counselor may contain errors or may not fit your particular situation. They do not replace professional, medical, legal, financial, psychological, or in-person pastoral advice.'
        ],
        items: []
      },
      content: {
        title: 'Your content',
        paragraphs: [
          'You remain responsible for the content you write, save, or share. By using features such as diary, chats, and shared links, you authorize the application to process that content to provide the service.'
        ],
        items: []
      },
      availability: {
        title: 'Service availability',
        paragraphs: [
          'We try to keep the application available and working correctly, but interruptions, errors, maintenance, or feature changes may occur.'
        ],
        items: []
      },
      changes: {
        title: 'Changes',
        paragraphs: [
          'We may update these terms when the application, service operation, or legal requirements change. The current version will be published on this page.'
        ],
        items: []
      },
      contact: {
        title: 'Contact',
        paragraphs: [
          'For questions about these terms, support, or requests related to your account, visit the contact page.'
        ],
        items: []
      }
    }
  },
  contact: {
    title: 'Contact',
    back: 'Back',
    subtitle: 'We are available for questions about support, privacy, your account, or how Home With Christ works.',
    email: {
      title: 'Contact email',
      description: 'Use this email for support, privacy requests, or general questions.',
      value: 'hwc@alexanderm.co'
    },
    support: {
      title: 'Support',
      description: 'Describe the issue, your account phone number if applicable, and the steps to reproduce it.',
      value: 'We respond as soon as possible.'
    },
    privacy: {
      title: 'Privacy',
      description: 'You can also review how we handle information inside the application.',
      value: 'View Privacy Policy'
    }
  },
  welcome: {
    login: 'Sign in',
    createAccount: 'Create account',
    limitTitle: 'Continue your conversation',
    limitMessage: 'You have used your trial message. Sign in or create an account to keep talking with Hope and save your conversations.'
  }
}
