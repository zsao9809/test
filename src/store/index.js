
import { getCookie, setCookie } from '@/utils/cookie';
import { createStore } from 'vuex';

const store = createStore({
    state() {
        return {
            // token
            token: getCookie('token') ?? '',
            //用户
            user: JSON.parse(sessionStorage.getItem('user') ?? '{}'),
            //文件列表
            file_list: JSON.parse(sessionStorage.getItem('file_list') ?? '[]'),
            //文件列表
            template_list: JSON.parse(sessionStorage.getItem('template_list') ?? '[]'),
            //更新头像的 key
            update_avatar: false,
            //学科列表
            class_list: JSON.parse(sessionStorage.getItem('class_list') ?? '[]'),
        }
    },
    mutations: {
        setClassList(state, class_list) {
            state.class_list = class_list;
            sessionStorage.setItem('class_list', JSON.stringify(class_list));
        },
        setFileList(state, file_list) {
            state.file_list = file_list;
            sessionStorage.setItem('file_list', JSON.stringify(file_list));
        },
        setTemplateList(state, template_list) {
            state.template_list = template_list;
            sessionStorage.setItem('template_list', JSON.stringify(template_list));
        },
        setToken(state, token) {
            state.token = token;
            setCookie('token', token, 3);
        },
        setUser(state, user) {
            state.user = user;
            sessionStorage.setItem('user', JSON.stringify(user));
        },
        updateAvatar(state) {
            state.update_avatar = !state.update_avatar;
        },
    },
    getters: {
        getFileList(state) {
            return state.file_list;
        },
        getTemplateList(state) {
            return state.template_list;
        },
    },
})

export default store;