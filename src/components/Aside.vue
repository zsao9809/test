<template>
    <el-scrollbar>
        <el-menu :default-active="file_id ?? template_id" :default-openeds="[`${template_id ? '2' : '1'}`]" :router="true" unique-opened>
            <el-sub-menu index="1">
                <template #title>
                    <el-icon><Document /></el-icon>文件列表
                </template>
                <el-menu-item :route="{ path: '/report/' + e.file_id, query: {update: true} }" v-for="(e, idx) in file_list" :key="e.file_id" :index="e.file_id">
                    <el-col :span="20" class="ellipsis">
                        {{ e.file_name }}
                    </el-col>
                    <el-col :span="4" style="display: flex; align-items: center;">
                        <el-dropdown size="small">
                            <el-icon><Setting /></el-icon>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="copyFile(e.file_id)">复制</el-dropdown-item>
                                    <el-dropdown-item @click="delFile(e.file_id)">删除</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </el-col>
                </el-menu-item>
                <el-menu-item index="main" style="padding-left: 20px; display: flex; justify-content: center; align-items: center;">
                    <el-button @click="addFile" type="primary">添加文件</el-button>
                </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2">
                <template #title>
                    <el-icon><Memo /></el-icon>我的模板
                </template>
                <el-menu-item :route="{ path: '/template/' + e.template_id, query: {update: true} }" v-for="(e, idx) in template_list" :key="e.template_id" :index="e.template_id">
                    <el-col :span="20" class="ellipsis">
                        {{ e.template_name }}
                    </el-col>
                    <el-col :span="4" style="display: flex; align-items: center;">
                        <el-dropdown size="small">
                            <el-icon><Setting /></el-icon>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="copyTemp(e.template_id)">复制</el-dropdown-item>
                                    <el-dropdown-item @click="delTemp(e.template_id)">删除</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </el-col>
                </el-menu-item>
                <el-menu-item index="main" style="padding-left: 20px; display: flex; justify-content: center; align-items: center;">
                    <el-button @click="addTemp" type="primary">创建模板</el-button>
                </el-menu-item>
            </el-sub-menu>
        </el-menu>
    </el-scrollbar>
</template>

<script setup>
import { addReport, checkLogin, delReport, addTemplate, delTemplate, getTemplateInfo, editTemplate, getReportInfo, editReport } from '@/http/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from '@/http';

const router = useRouter();
const route = useRoute();
const store = useStore();

const file_id = route.params.file_id;
const template_id = route.params.template_id;

let file_list = computed(() => {
    return store.getters.getFileList;
})
let template_list = computed(() => {
    return store.getters.getTemplateList;
})

const addFile = async () => {
    let r = await checkLogin();
    if (r.data.code != 1)
        return ElMessage({
            message: '请先登录',
            type: 'error',
        })
    const res = await addReport();
    if (res.data.code != 1)
        return ElMessage({
            message: res.data.msg,
            type: 'error',
        })
    
    let files = store.state.file_list;
    files.push(res.data.data);
    store.commit('setFileList', files);

    ElMessage({
        message: res.data.msg,
        type: 'success',
        duration: 1000,
        onClose() {
            router.push(`/report/${res.data.data.file_id}`);
        },
    })
}

const delFile = async (file_id) => {
    let files = store.state.file_list;
    let idx = files.findIndex(e => e.file_id == file_id);

    ElMessageBox.confirm(`确定要删除${files[idx].file_name}吗？`, '删除文件', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        const res = await delReport(file_id);
        if (res.data.code != 1)
            return ElMessage({
                message: '删除失败',
                type: 'error',
            })
    
        files.splice(idx, 1);
        store.commit('setFileList', files);
        const path = route.path;
        if (path.split('/')[2] == file_id) router.push('/');

        ElMessage({
            message: res.data.msg,
            type: 'success',
        })
    }).catch(() => {
        ElMessage({
            type: 'success',
            message: '已取消删除',
        })
    })
}

const copyFile = async (file_id) => {
    //添加文件
    let res = await addReport();
    if (res.data.code != 1)
        return ElMessage({
            message: '添加文件失败',
            type: 'error',
        })
    let files = store.state.file_list;
    files.push(res.data.data);
    store.commit('setFileList', files);
    //请求数据
    let fileData = await getReportInfo(file_id);
    if (fileData.data.code != 1)
        return ElMessage({
            message: '获取文件失败',
            type: 'error',
        })
    //存储数据
    let file = res.data.data;
    file.file_name = fileData.data.data.file_name + '副本';
    file.file_data = JSON.parse(JSON.stringify(fileData.data.data.file_data));
    //复制到文件
    res = await editReport(file.file_id, file);
    if (res.data.code != 1)
        return ElMessage({
            message: '复制文件失败',
            type: 'error',
        })
    let idx = files.findIndex(e => e.file_id == file.file_id);
    files[idx] = file;
    store.commit('setFileList', files);
    //跳转页面
    router.push(`/report/${file.file_id}`);
    ElMessage({
        type: 'success',
        message: '复制成功',
    })
}

const addTemp = async () => {
    let r = await checkLogin();
    if (r.data.code != 1)
        return ElMessage({
            message: '请先登录',
            type: 'error',
        })
    const res = await addTemplate();
    if (res.data.code != 1)
        return ElMessage({
            message: res.data.msg,
            type: 'error',
        })
    
    let templates = store.state.template_list;
    templates.push(res.data.data);
    store.commit('setTemplateList', templates);

    ElMessage({
        message: res.data.msg,
        type: 'success',
        duration: 1000,
        onClose() {
            router.push(`/template/${res.data.data.template_id}`);
        },
    })
}

const delTemp = async (template_id) => {
    let templates = store.state.template_list;
    let idx = templates.findIndex(e => e.template_id == template_id);

    ElMessageBox.confirm(`确定要删除${templates[idx].template_name}吗？`, '删除模板', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        const res = await delTemplate(template_id);
        if (res.data.code != 1)
            return ElMessage({
                message: '删除失败',
                type: 'error',
            })
    
        templates.splice(idx, 1);
        store.commit('setTemplateList', templates);
        const path = route.path;
        if (path.split('/')[2] == template_id) router.push('/');

        ElMessage({
            message: res.data.msg,
            type: 'success',
        })
    }).catch(() => {
        ElMessage({
            type: 'success',
            message: '已取消删除',
        })
    })
}

const copyTemp = async (template_id) => {
    //添加模板
    let res = await addTemplate();
    if (res.data.code != 1)
        return ElMessage({
            message: '添加模板失败',
            type: 'error',
        })
    let templates = store.state.template_list;
    templates.push(res.data.data);
    store.commit('setTemplateList', templates);
    //请求数据
    let tempData = await getTemplateInfo(template_id);
    if (tempData.data.code != 1)
        return ElMessage({
            message: '获取模板失败',
            type: 'error',
        })
    //存储数据
    let temp = res.data.data;
    temp.template_name = tempData.data.data.template_name + '副本';
    temp.template_data = JSON.parse(JSON.stringify(tempData.data.data.template_data));
    //复制到模板
    res = await editTemplate(temp.template_id, temp);
    if (res.data.code != 1)
        return ElMessage({
            message: '复制模板失败',
            type: 'error',
        })
    let idx = templates.findIndex(e => e.template_id == temp.template_id);
    templates[idx] = temp;
    store.commit('setTemplateList', templates);
    //跳转页面
    router.push(`/template/${temp.template_id}`);
    ElMessage({
        type: 'success',
        message: '复制成功',
    })
}

</script>

<style scoped >
.ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* width: 200px; */
}
</style>