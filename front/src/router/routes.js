const routes = [
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') }
    ]
  },
  {
    path: '/welcome',
    component: () => import('layouts/LoginLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: '',
        component: () => import('pages/AdvisorPage.vue'),
        props: { guestMode: true }
      }
    ]
  },
  {
    path: '/forgot-password',
    component: () => import('layouts/LoginLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', component: () => import('pages/ForgotPasswordPage.vue') }
    ]
  },
  {
    path: '/reset-password',
    component: () => import('layouts/LoginLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', component: () => import('pages/ResetPasswordPage.vue') }
    ]
  },
  {
    path: '/privacy-policy',
    component: () => import('layouts/LoginLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', component: () => import('pages/PrivacyPolicyPage.vue') }
    ]
  },
  {
    path: '/terms',
    component: () => import('layouts/LoginLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', component: () => import('pages/TermsPage.vue') }
    ]
  },
  {
    path: '/contact',
    component: () => import('layouts/LoginLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', component: () => import('pages/ContactPage.vue') }
    ]
  },
  {
    path: '/shared-chat/:token',
    name: 'shared-chat',
    component: () => import('layouts/LoginLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', component: () => import('pages/SharedChatPage.vue') }
    ]
  },
  {
    path: '/shared-diary/:token',
    name: 'shared-diary',
    component: () => import('layouts/LoginLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', component: () => import('pages/SharedDiaryPage.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'advisor', component: () => import('pages/AdvisorPage.vue') },
      { path: 'bible', component: () => import('pages/BiblePage.vue'), meta: { public: true } },
      { path: 'diary', component: () => import('pages/DiaryPage.vue') },
      { path: 'diary/:id', component: () => import('pages/DiaryEntryPage.vue') },
      { path: 'admin', component: () => import('pages/AdminPage.vue'), meta: { requiresAdmin: true } },
      { path: 'verse-corrections', component: () => import('pages/VerseCorrectionsPage.vue'), meta: { requiresAdmin: true } },
      { path: 'training', component: () => import('pages/TrainingPage.vue'), meta: { requiresAdmin: true } },
      { path: 'topics', component: () => import('pages/TopicsPage.vue'), meta: { requiresAdmin: true } },
      { path: 'training-reflections', component: () => import('pages/TrainingReflectionsPage.vue'), meta: { requiresAdmin: true } },
      { path: 'users', component: () => import('pages/UsersPage.vue'), meta: { requiresAdmin: true } },
      { path: 'daily-verses', component: () => import('pages/DailyVersesPage.vue'), meta: { requiresAdmin: true } },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'delete-account', component: () => import('pages/DeleteAccountPage.vue') },
      { path: 'change-password', component: () => import('pages/ChangePasswordPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
