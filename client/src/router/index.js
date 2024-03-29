import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home'
import Login from '../views/Login'
import Signup from '../views/Signup'
import Account from '../views/Account'
import Single from '../views/Single'
import Profile from '../views/Profile'
import Admin from '../views/Admin'
import Search from '../views/Search'
import PageNotFound from '../views/PageNotFound'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/account',
    name: 'Account',
    component: Account
  },
  {
    path: '/single/:id',
    name: 'Single',
    component: Single
  },
  {
    path: '/profile/:username',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  },
  {
    path: '/search/:username',
    name: 'Search',
    component: Search
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: PageNotFound
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkExactActiveClass: 'active'
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/signup']
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = localStorage.getItem('user') || false

  if (authRequired && !loggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
