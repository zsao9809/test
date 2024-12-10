import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/dist/index.css";
import "@vue-office/docx/lib/index.css"
import store from "@/store"
import axios from "@/http"

const app = createApp(App);

//注册所有的 element‐plus 内组件
for (const [key, component] of Object.entries(ElementPlusIconsVue))
    app.component(key, component);
app.use(ElementPlus);

app.use(store);

app.use(router);

axios.interceptors.request.use((req) => {
    const token = store.state.token;
    req.headers.Authorization = 'Bearer ' + token;
    return req;
})

axios.interceptors.response.use((res) => {
    if (res.data.data?.token)
        store.commit('setToken', res.data.data?.token);
    if (res.data.data?.user)
        store.commit('setUser', res.data.data?.user);
    if (res.data.data?.file_list)
        store.commit('setFileList', res.data.data?.file_list);
    if (res.data.data?.template_list)
        store.commit('setTemplateList', res.data.data?.template_list);
    if (res.data.data?.subject_list)
        store.commit('setClassList', res.data.data?.subject_list?.map(e => e.subject_name));
    return res;
})

app.mount('#app');
