const routes = [
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') }
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
      { path: 'users', component: () => import('pages/UsersPage.vue'), meta: { requiresAdmin: true } },
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
