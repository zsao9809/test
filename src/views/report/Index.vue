<template>
    <div class="work">
        <div class="header">
            <el-page-header @back="goHome" title="文件" :icon="null">
                <template #content>
                    <span v-if="!inputVisible" class="text-large font-600 mr-3" style="display: flex; align-items: center;">
                        {{ report.file_name }}
                        <el-button @click="showInput" text>
                            <el-icon><Edit /></el-icon>
                        </el-button>
                    </span>
                    <el-input v-else @blur="hideInput" ref="refInput" v-model.trim="report.file_name"></el-input>
                </template>
                <template #extra>
                    <div class="flex items-center">
                        <el-button @click="showTemplate" type="primary" class="ml-2">使用模板</el-button>
                        <el-button @click="clear" type="danger" class="ml-2">清空</el-button>
                    </div>
                </template>
            </el-page-header>
        </div>
        <div class="main">
            <el-form :model="report.file_data" label-width="auto">
                <el-form-item label="课程名称">
                    <el-select v-model="report.file_data.class_name" placeholder="请选择">
                        <el-option v-for="e in store.state.class_list" :label="e" :value="e" />
                    </el-select>
                </el-form-item>
                <el-form-item label="报告册标题">
                    <el-input v-model="report.file_data.title" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="详细设计">
                    <el-table :data="report.file_data.list" max-height="386" :border="true">
                        <el-table-column type="index" :align="'center'" />
                        <el-table-column label="实验标题" :align="'center'">
                            <template #default="props">
                                <el-input v-model="props.row.title"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="实验简介" :align="'center'">
                            <template #default="props">
                                <el-input v-model="props.row.desc" :autosize="{ minRows: 1, maxRows: 4 }"
                                    type="textarea"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" :align="'center'">
                            <template #default="props">
                                <el-button @click="goDetail(props.$index)" size="small">编辑详情</el-button>
                                <el-button @click="addList(props.row, props.$index)" size="small">复制</el-button>
                                <el-popconfirm @confirm="delList(props.$index)" title="确认要删除吗？"
                                    confirm-button-text="确认" cancel-button-text="取消">
                                    <template #reference>
                                        <el-button size="small" type="danger">删除</el-button>
                                    </template>
                                </el-popconfirm>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form-item>
                <el-form-item>
                    <el-button @click="addList({ title: '', desc: '' }, report.file_data.list.length)">添加一项</el-button>
                    <el-upload class="upload-button"
                    :action="axios.defaults.baseURL + REPORTUPLOAD + file_id"
                    :headers="{'Authorization': 'Bearer ' + store.state.token}"
                    :on-success="onUploadSuccess" :on-error="onUploadError" :before-upload="beforeUpload"
                    accept=".xlsx, .json" :show-file-list="false">
                        <el-button @click.stop="uploadFile">
                            导入文件
                            <el-tooltip content="示例文件" placement="top">
                                <el-link :href="axios.defaults.baseURL + EXAMPLEFILE"
                                @click.stop="" type="info" style="margin-left: 3px;">
                                    <el-icon><View /></el-icon>
                                </el-link>
                            </el-tooltip>
                        </el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item>
                    <el-button @click="saveReport">
                        <span>保存</span>
                        <span style="margin-left: 2px;">{{ showAutoSave }}</span>
                    </el-button>
                    <el-button @click="onSubmit" type="primary">创建</el-button>
                    <el-button @click="preview" :disabled="!report.is_created" type="primary">预览</el-button>
                    <el-button @click="downloadFile" :disabled="!report.is_created" type="success">下载</el-button>
                    <el-switch v-model="report.is_enable_ai" style="margin: 0 12px;" active-text="AI润色" />
                    <div class="algin_right son_center">
                        <el-dropdown size="large">
                            <el-button>导出</el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="exportFile('execl')">Excel</el-dropdown-item>
                                    <el-dropdown-item @click="exportFile('json')">json</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <el-button @click="saveToTemp" style="margin-left: 12px;"type="primary">保存为模板</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </div>
    </div>
    <!-- 预览文件 -->
    <el-dialog v-model="dialogPreviewVisible" title="预览文件" width="800">
        <vue-office-docx :src="fileUrl" />
    </el-dialog>
    <!-- 模板列表 -->
    <el-dialog v-model="dialogTemplateVisible" title="选择模板" width="800">
        <el-table :data="showTempList"  max-height="386">
            <el-table-column label="模板名称" prop="template_name" :align="'left'"/>
            <el-table-column label="所属学科" prop="template_data.class_name" :align="'center'"
            :filters="tempClassFilters"
            :filter-method="tempClassFilter" filter-placement="bottom-end" />
            <el-table-column label="来源" prop="user_id" :align="'center'"
            :filters="[{ text: '官方', value: '0' }, { text: '自定义', value: `${store.state.user.user_id}` },]"
            :filter-method="tempFromFilter" filter-placement="bottom-end">
                <template #default="temp">
                    <el-tag :type="temp.row.user_id === '0' ? 'primary' : 'success'" disable-transitions>
                        {{ temp.row.user_id === '0' ? '官方' : '自定义' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" :align="'center'">
                <template #header>
                    <el-input v-model="tempSearch" size="small" placeholder="搜索模板" />
                </template>
                <template #default="temp">
                    <el-button @click="showPreviewTemp(temp.row.template_id)" size="small">预览</el-button>
                    <el-button @click="useTemp(temp.row.template_id)" type="primary" size="small">使用</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-dialog>
    <!-- 预览模板 -->
    <el-dialog v-model="dialogPreviewTempVisible" :title="previewTemp.template_name" width="800">
        <el-collapse accordion>
            <el-collapse-item v-for="(e, idx) in previewTemp.template_data.list" :name="idx">
                <template #title>
                    <span class="ellipsis" style="width: 200px; text-align: left; margin-right: 25px">{{ e.title }}</span>
                    <span class="ellipsis" style="width: 500px; text-align: left;">{{ e.desc }}</span>
                </template>
                <el-table :data="e.paragraphs">
                    <el-table-column label="段落标题" prop="title" :header-align="'center'" width="250" />
                    <el-table-column label="段落文本" prop="desc" :header-align="'center'" />
                </el-table>
            </el-collapse-item>
        </el-collapse>
        <div style="margin-top: 10px;">
            <el-button @click="showPreviewTemp(previewTemp.template_id)">返回</el-button>
            <el-button @click="useTemp(previewTemp.template_id)" type="primary">使用</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, nextTick, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { REPORTUPLOAD, EXAMPLEFILE, REPORTEXPORT, REPORTDOWNLOAD } from '@/http/url';
import axios from '@/http';
import VueOfficeDocx from '@vue-office/docx';
import { createReport, editReport, getReportInfo, getTemplateList, getOfficialTemplateList, addTemplate, editTemplate, exportReport, downloadReport } from '@/http/api';

const router = useRouter();
const route = useRoute();
const store = useStore();

const file_id = route.params.file_id;
const report = ref({
    user_id: '',
    file_id: file_id,
    is_created: false,
    is_enable_ai: false,
    file_name: '',
    file_data: {
        class_name: '',
        title: '',
        list: [
            {
                title: '',
                desc: '',
            }
        ]
    },
})

const is_update = route.query.update;
const update = () => {
    getReportInfo(file_id).then(res => {
        if (res.data.code != 1) {
            return ElMessage({
                message: '获取文件信息失败',
                type: 'error',
            })
        }
        report.value = res.data.data;
        if (report.value.is_created)
            downloadReport(file_id)
                .then(resp => {
                    const url = window.URL.createObjectURL(new Blob([resp.data]));
                    fileUrl.value = url;
                })
                .catch(err => ElMessage({ message: err, type: 'error' }));
    })
}
if (!is_update) {
    let res = store.state.file_list.find(e => e.file_id == file_id);
    if (res) {
        report.value = res;
        if (report.value.is_created)
            downloadReport(file_id)
                .then(resp => {
                    const url = window.URL.createObjectURL(new Blob([resp.data]));
                    fileUrl.value = url;
                })
                .catch(err => ElMessage({ message: err, type: 'error' }));
    }
    else update();
} else update();

const saveReport = async () => {
    autoSaveValue.value = 60 * 3;
    if (report.value.file_name == '')
        return ElMessage({
                message: '文件名不能为空',
                type: 'error',
            })
    const res = await editReport(file_id, report.value);
    if (res.data.code != 1)
        return ElMessage({
            message: res.data.msg,
            type: 'error',
        })
    
    let files = store.state.file_list;
    let idx = files.findIndex(e => e.file_id == file_id);
    files[idx] = report.value;
    store.commit('setFileList', files);

    ElMessage({
        message: '保存成功',
        type: 'success',
    })
}

const goDetail = (idx) => {
    let files = store.state.file_list;
    let index = files.findIndex(e => e.file_id == file_id);
    files[index] = report.value;
    store.commit('setFileList', files);
    router.push(`/report/${file_id}/${idx}`);
}

const clear = () => {
    ElMessageBox.confirm('确定要清空当前文档吗？', '清空文档', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        report.value.file_data = {
            class_name: '',
            title: '',
            list: [
                {
                    title: '',
                    desc: '',
                }
            ]
        },

        ElMessage({
            type: 'success',
            message: '清空成功',
        })
    }).catch(() => {
        ElMessage({
            type: 'success',
            message: '已取消清空',
        })
    })
}

const addList = (e, idx) => {
    report.value.file_data.list.splice(idx, 0, { ...e });
}

const delList = (idx) => {
    report.value.file_data.list.splice(idx, 1);
}

const onSubmit = () => {
    autoSaveValue.value = 60 * 3;
    if (report.value.file_name == '')
        return ElMessage({
                message: '文件名不能为空',
                type: 'error',
            })
    
    let msg = '';
    if (report.value.is_enable_ai) msg = '，启用ai润色功能生成较慢，请稍等';

    const loading = ElLoading.service({
        lock: false,
        text: '生成中' + msg,
        background: 'rgba(0, 0, 0, 0.7)',
    })

    createReport(file_id, report.value)
        .then(res => {
            if (res.data.code != 1) {
                loading.close();
                return ElMessage({
                    message: res.data.msg,
                    type: 'error',
                })
            }
            report.value = res.data.data;

            downloadReport(file_id)
                .then(resp => {
                    const url = window.URL.createObjectURL(new Blob([resp.data]));
                    fileUrl.value = url;
                })
                .catch(err => ElMessage({ message: err, type: 'error' }));

            loading.close();
            ElMessage({
                message: '生成成功',
                type: 'success',
            })
        })
        .catch(err => {
            loading.close();
            ElMessage({
                message: '生成失败',
                type: 'error',
            })
            console.log(err);
        })
}

const goHome = () => {
    router.push('/');
}

let dialogPreviewVisible = ref(false);
let fileUrl = ref('');
const preview = () => {
    dialogPreviewVisible.value = true;
}

const downloadFile = () => {
    const link = document.createElement('a');
    link.href = fileUrl.value;
    //文件名
    const file_name = report.value.file_name + '.docx';
    link.setAttribute('download', file_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

let dialogTemplateVisible = ref(false);
const showTemplate = () => {
    dialogTemplateVisible.value = true;
}

let dialogPreviewTempVisible = ref(false);
let previewTemp = ref({});
const showPreviewTemp = (template_id) => {
    if (dialogPreviewTempVisible.value)
        return dialogPreviewTempVisible.value = false;
    previewTemp.value = tempList.value.find(e => e.template_id == template_id);
    if (!previewTemp.value) return ElMessage({
        message: '预览失败',
        type: 'error',
    })
    dialogPreviewTempVisible.value = true;
}

const tempList = ref([]);
getTemplateList().then(res => {
    if (res.data.code != 1)
        return ElMessage({
            message: '获取自定义模板列表失败',
            type: 'error',
        })
    tempList.value = [...tempList.value, ...res.data.data];
})
getOfficialTemplateList().then(res => {
    if (res.data.code != 1)
        return ElMessage({
            message: '获取官方模板列表失败',
            type: 'error',
        })
    tempList.value = [...tempList.value, ...res.data.data];
})

const tempClassFilters = []
store.state.class_list.forEach(e => tempClassFilters.push({ text: e, value: e }));
const tempClassFilter = (val, row) => {
    return row.template_data.class_name == val;
}
const tempFromFilter = (val, row) => {
    return row.user_id == val;
}

const tempSearch = ref('');
const showTempList = computed(() => {
    return tempList.value.filter(e => !tempSearch.value || e.template_name.toLowerCase().includes(tempSearch.value.toLowerCase()));
})

const useTemp = (template_id) => {
    let temp = tempList.value.find(e => e.template_id == template_id);
    if (!temp) return ElMessage({
        message: '使用失败',
        type: 'error',
    })
    ElMessageBox.confirm('使用模板将会清空当前文本，您确定吗？', '使用模板', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        report.value.file_data = JSON.parse(JSON.stringify(temp.template_data));
        ElMessage({
            type: 'success',
            message: '使用成功',
            duration: 1000,
            onClose() {
                dialogPreviewTempVisible.value = false;
                dialogTemplateVisible.value = false;
            },
        })
    }).catch(() => {
        ElMessage({
            type: 'success',
            message: '已取消使用',
        })
    })
}

const saveToTemp = () => {
    ElMessageBox.confirm('您确定要将当前文件保存为模板吗？', '保存为模板', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
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
        //存储数据
        let temp = res.data.data;
        temp.template_name = report.value.file_name;
        temp.template_data = JSON.parse(JSON.stringify(report.value.file_data));
        //复制到模板
        res = await editTemplate(temp.template_id, temp);
        if (res.data.code != 1)
            return ElMessage({
                message: '保存模板失败',
                type: 'error',
            })
        let idx = templates.findIndex(e => e.template_id == temp.template_id);
        templates[idx] = temp;
        store.commit('setTemplateList', templates);
        //跳转页面
        router.push(`/template/${temp.template_id}`);
        ElMessage({
            type: 'success',
            message: '保存成功',
        })
    }).catch(() => {
        ElMessage({
            type: 'success',
            message: '已取消',
        })
    })
}

const inputVisible = ref(false);
const refInput = ref();
const showInput = () => {
    inputVisible.value = true;
    nextTick(() => {
        refInput.value.focus();
    })
}
const hideInput = () => {
    inputVisible.value = false;
}

//自动保存，3分钟一次
let autoSaveValue = ref(60 *3);
setInterval(() => autoSaveValue.value--, 1000);
watch(autoSaveValue, (newVal, oldVal) => newVal == 0 && saveReport());
let showAutoSave = computed(() => {
    const min = Math.floor(autoSaveValue.value / 60);
    const second = autoSaveValue.value % 60;
    const formattedMinutes = String(min).padStart(2, '0');
    const formattedSeconds = String(second).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
})

//上传相关
const uploadFile = (e) => {
    ElMessageBox.confirm('导入文件将会清空当前文本，您确定吗？', '导入文件', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
    .then(() => {
        let clickEvent = new MouseEvent('click', {
            'bubbles': true, //允许事件冒泡
            'cancelable': true, //允许取消默认行为
        });
        e.target.parentNode.parentNode.dispatchEvent(clickEvent);
    })
    .catch(() => {
        ElMessage({ message: '已取消', type: 'success' });
    })
}
const beforeUpload = (file) => {
    // 定义Excel和JSON文件的MIME类型
    const excelMimeTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const jsonMimeType = 'application/json';
    //文件扩展名转换为小写
    const fileExtension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    //检查文件类型
    if (!excelMimeTypes.includes(file.type) && fileExtension !== 'json') {
        ElMessage.error('请选择Excel或JSON格式文件');
        return false;
    } else if (file.size / 1024 / 1024 > 10) {
        ElMessage.error('文件不能大于10MB');
        return false;
    }
    return true;
}
const onUploadSuccess = (res) => {
    if (res.code != 1)
        return ElMessage({
            message: res.msg,
            type: 'error',
        })
    report.value.file_data = res.report.file_data;
    let files = store.state.file_list;
    let idx = files.findIndex(e => e.file_id == file_id);
    files[idx] = report.value;
    store.commit('setFileList', files);
    autoSaveValue.value = 60 * 3;
    ElMessage({
        message: res.msg,
        type: 'success',
    })
}
const onUploadError = (res) => {
    ElMessage({
        message: res.msg,
        type: 'error',
    })
}

//导出文件
const exportFile = (format) => {
    exportReport(file_id, format)
        .then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            //文件名
            let file_name = report.value.file_name + '.xlsx';
            if (format == 'json') file_name = report.value.file_name + '.json';
            link.setAttribute('download', file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => ElMessage({ message: err, type: 'error' }));
}

</script>

<style scoped >
.work {
    width: 80%;
}

.header {
    margin-bottom: 20px;
}

.algin_right {
    margin-left: auto;
}

.son_center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* width: 200px; */
}

.upload-button {
    display: flex;
    align-items: center;
    margin-left: 12px;
}

.export_select {
    width: 80px;
}

el-link:hover {
    background-color: #000;
}
</style>