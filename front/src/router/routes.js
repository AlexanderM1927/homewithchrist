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
      { path: 'bible', component: () => import('pages/BiblePage.vue') },
      { path: 'diary', component: () => import('pages/DiaryPage.vue') },
      { path: 'diary/:id', component: () => import('pages/DiaryEntryPage.vue') },
      { path: 'admin', component: () => import('pages/AdminPage.vue'), meta: { requiresAdmin: true } },
      { path: 'training', component: () => import('pages/TrainingPage.vue'), meta: { requiresAdmin: true } },
      { path: 'training-reflections', component: () => import('pages/TrainingReflectionsPage.vue'), meta: { requiresAdmin: true } },
      { path: 'users', component: () => import('pages/UsersPage.vue'), meta: { requiresAdmin: true } },
      { path: 'daily-verses', component: () => import('pages/DailyVersesPage.vue'), meta: { requiresAdmin: true } },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') }
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
