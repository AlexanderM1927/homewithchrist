export default {
  nav: {
    home: 'Home',
    counselor: 'Counselor',
    verse: 'Verse',
    advisor:  'Counselor',
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
    updateError: 'Could not update entry'
  },
  training: {
    title: 'AI Training',
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
    empty: 'No verses saved yet.',
    required: 'Required field',
    topics: 'Topics',
    loadTopicsError: 'Could not load topics',
    loadVersesError: 'Could not load verses',
    saveSuccess: 'Verse saved successfully',
    saveError: 'Error saving',
    weightBadge: 'weight: {weight}',
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
  admin: {
    title: 'Administration Panel',
    options: {
      training: {
        label: 'Train AI',
        desc: 'Add and manage Bible training verses'
      },
      users: {
        label: 'Manage Users',
        desc: 'View and change roles for registered users'
      }
    }
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
    name: 'Name (optional)',
    nameMin: 'Minimum 2 characters',
    phone: 'Phone number',
    phoneRequired: 'Phone number is required',
    phoneInvalid: 'Enter a valid phone number',
    pin: 'PIN (4 digits)',
    submit: 'Sign In',
    language: 'Language'
  },
  profile: {
    title: 'My Profile',
    subtitle: 'Edit your personal information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone / Mobile',
    save: 'Save changes',
    required: 'Required field',
    invalidEmail: 'Invalid email',
    saveSuccess: 'Profile updated successfully',
    saveError: 'Error updating profile'
  },
  advisor: {
    title: 'Hope AI',
    subtitle: 'Spiritual Counselor · always available',
    historyTitle: 'Your latest chats',
    loadingHistory: 'Loading history...',
    emptyHistory: 'You do not have saved chats yet.',
    welcomeTitle: 'Hello, I am your Counselor',
    welcomeDesc: 'I am here to listen to you and accompany you in faith. You can share whatever is on your heart.',
    inputPlaceholder: 'Type your message...',
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
  }
}
