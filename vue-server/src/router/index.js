import Vue from 'vue'
import Router from 'vue-router'
import HomePage from '@/components/HomePage'
import ProjectDetail from '@/components/ProjectDetail'
import RegisterUser from '@/components/RegisterUser'
import LoginUser from '@/components/LoginUser'
import UpdateUser from '@/components/UpdateUser'
import CreateProject from '@/components/CreateProject'
import UpdateProject from '@/components/UpdateProject'
import PledgeProject from '@/components/PledgeProject'
import ProjectList from '@/components/ProjectList'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage
    },
    {
      path: '/projects/:id',
      name: 'ProjectDetail',
      component: ProjectDetail
    },
    {
      path: '/users/register',
      name: 'RegisterUser',
      component: RegisterUser
    },
    {
      path: '/users/login',
      name: 'LoginUser',
      component: LoginUser
    },
    {
      path: '/users/:id',
      name: 'UpdateUser',
      component: UpdateUser
    },
    {
      path: '/projects/create/new',
      name: 'CreateProject',
      component: CreateProject,
    },
    {
      path: '/projects/update/:id',
      name: 'UpdateProject',
      component: UpdateProject
    },
    {
      path: '/projects/pledge/:id',
      name: 'PledgeProject',
      component: PledgeProject
    },
    {
      path: '/projects/list/:type',
      name: 'ProjectList',
      component: ProjectList
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})
