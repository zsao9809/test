import { createRouter, createWebHistory } from 'vue-router'
import { checkLogin, getReportList, getTemplateList } from '@/http/api'

let routes = [
    {
        path: '/',
        redirect: '/index/main',
    },
    {
        path: '/index',
        name: 'index',
        component: () => import('@/views/index/Index.vue'),
        children: [
            {
                path: 'main',
                component: () => import('@/views/index/Main.vue'),
            }
        ],
    },
]
const reportRoutes = {
    path: '/report',
    name: 'report',
    component: () => import('@/views/index/Index.vue'),
    children: [
        {
            path: ':file_id',
            component: () => import('@/views/report/Index.vue'),
        },
        {
            path: ':file_id/:index',
            component: () => import('@/views/report/Detail.vue'),
        },
    ]
}
const templateRoutes = {
    path: '/template',
    name: 'template',
    component: () => import('@/views/index/Index.vue'),
    children: [
        {
            path: ':template_id',
            component: () => import('@/views/template/Index.vue'),
        },
        {
            path: ':template_id/:index',
            component: () => import('@/views/template/Detail.vue'),
        },
    ]
}
const userRoutes = {
    path: '/user',
    name: 'user',
    component: () => import('@/views/index/Index.vue'),
    children: [
        {
            path: 'index',
            component: () => import('@/views/user/Index.vue'),
        },
    ]
}
const errorRoutes = {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
}

routes.push(reportRoutes);
routes.push(templateRoutes);
routes.push(userRoutes);
routes.push(errorRoutes);

// routes.forEach(e => e.path = '/test' + e.path);

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
})

router.beforeEach(async (to, from, next) => {
    if (to.path != '/index/main') {
        const res = await checkLogin();
        if (res.data.code != 1) {
            router.push('/index/main');
            return next(false);
        }

        if (to.path.startsWith('/report')) {
            const { data } = await getReportList();
            if (data.code != 1) {
                router.push('/index/main');
                return next(false);
            }
            const file_id = to.path.split('/')[2];
            const file = data.data.find(e => e.file_id == file_id);
            if (!file) {
                router.push('/index/main');
                return next(false);
            }
        }
        if (to.path.startsWith('/template')) {
            const { data } = await getTemplateList();
            if (data.code != 1) {
                router.push('/index/main');
                return next(false);
            }
            const template_id = to.path.split('/')[2];
            const template = data.data.find(e => e.template_id == template_id);
            if (!template) {
                router.push('/index/main');
                return next(false);
            }
        }
    }
    next();
})

export default router
