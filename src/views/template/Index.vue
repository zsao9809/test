<template>
    <div class="work">
        <div class="header">
            <el-page-header @back="goHome" title="模板" :icon="null">
                <template #content>
                    <span v-if="!inputVisible" class="text-large font-600 mr-3" style="display: flex; align-items: center;">
                        {{ template.template_name }}
                        <el-button @click="showInput" text>
                            <el-icon><Edit /></el-icon>
                        </el-button>
                    </span>
                    <el-input v-else @blur="hideInput" ref="refInput" v-model.trim="template.template_name"></el-input>
                </template>
                <template #extra>
                    <div class="flex items-center">
                        <el-button @click="useTest" type="primary" class="ml-2">测试用例</el-button>
                        <el-button @click="clear" type="danger">清空</el-button>
                    </div>
                </template>
            </el-page-header>
        </div>
        <div class="main">
            <el-form :model="template.template_data" label-width="auto">
                <el-form-item label="课程名称">
                    <el-select v-model="template.template_data.class_name" placeholder="请选择">
                        <el-option v-for="e in store.state.class_list" :label="e" :value="e" />
                    </el-select>
                </el-form-item>
                <el-form-item label="报告册标题">
                    <el-input v-model="template.template_data.title" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="详细设计">
                    <el-table :data="template.template_data.list" max-height="386" :border="true">
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
                    <el-button @click="addList({ title: '', desc: '' }, template.template_data.list.length)">添加一项</el-button>
                    <el-upload class="upload-button"
                    :action="axios.defaults.baseURL + TEMPLATEUPLOAD + template_id"
                    :headers="{'Authorization': 'Bearer ' + store.state.token}"
                    :on-success="onUploadSuccess" :on-error="onUploadError" :before-upload="beforeUpload"
                    accept=".xlsx, .json" :show-file-list="false">
                        <el-button>
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
                    <el-button @click="saveTemp">
                        <span>保存</span>
                        <span style="margin-left: 2px;">{{ showAutoSave }}</span>
                    </el-button>
                    <el-button @click="useToFile" type="primary">创建文件</el-button>
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
                    </div>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { TEMPLATEUPLOAD, EXAMPLEFILE } from '@/http/url';
import axios from '@/http';
import { useStore } from 'vuex';
import { addReport, editReport, editTemplate, exportTemplate, getTemplateInfo } from '@/http/api';

const router = useRouter();
const route = useRoute();
const store = useStore();

const template_id = route.params.template_id;
const template = ref({
    user_id: '',
    template_id: template_id,
    is_created: false,
    is_enable_ai: false,
    template_name: '',
    template_data: {
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
    getTemplateInfo(template_id).then(res => {
        if (res.data.code != 1) {
            return ElMessage({
                message: '获取模板信息失败',
                type: 'error',
            })
        }
        template.value = res.data.data;
    })
}
if (!is_update) {
    let res = store.state.template_list.find(e => e.template_id == template_id);
    if (res) template.value = res;
    else update();
} else update();

const saveTemp = async () => {
    autoSaveValue.value = 60 *3;
    if (template.value.template_name == '')
        return ElMessage({
                message: '模板名不能为空',
                type: 'error',
            })
    const res = await editTemplate(template_id, template.value);
    if (res.data.code != 1)
        return ElMessage({
            message: res.data.msg,
            type: 'error',
        })
    
    let templates = store.state.template_list;
    let idx = templates.findIndex(e => e.template_id == template_id);
    templates[idx] = template.value;
    store.commit('setTemplateList', templates);

    ElMessage({
        message: '保存成功',
        type: 'success',
    })
}

const goDetail = (idx) => {
    let templates = store.state.template_list;
    let index = templates.findIndex(e => e.template_id == template_id);
    templates[index] = template.value;
    store.commit('setTemplateList', templates);
    router.push(`/template/${template_id}/${idx}`);
}

const clear = () => {
    ElMessageBox.confirm('确定要清空当前模板吗？', '清空模板', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        template.value.template_data = {
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
    template.value.template_data.list.splice(idx, 0, { ...e });
}

const delList = (idx) => {
    template.value.template_data.list.splice(idx, 1);
}

const goHome = () => {
    router.push('/');
}

const useTest = () => {
    ElMessageBox.confirm('使用测试用例将会清空当前文本，您确定吗？', '使用测试用例', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        template.value.template_data.class_name = "计算机科学与技术";
        template.value.template_data.title = "计算机科学与技术实验报告";
        template.value.template_data.list = [
            { title: 'c语言helloworld', desc: '学习c语言printf函数，输出helloworld', paragraphs: [] },
            { title: '分支语句', desc: '学习c语言if-else分支语句', paragraphs: [] },
            { title: '循环语句', desc: '学习for循环语句', paragraphs: [] },
            { title: '函数编程', desc: '学习c语言函数', paragraphs: [] },
        ]
        template.value.template_data.list.forEach(e => {
            e.paragraphs = [
                {
                    title: '一、实验目的',
                    desc: '',
                },
                {
                    title: '二、实验仪器设备或材料',
                    desc: '',
                },
                {
                    title: '三、实验原理',
                    desc: '',
                },
                {
                    title: '四、实验内容与步骤',
                    desc: '',
                },
                {
                    title: '五、实验结果与分析',
                    desc: '',
                },
                {
                    title: '六、结论与体会',
                    desc: '',
                },
                {
                    title: '七、教师评语',
                    desc: '',
                },
            ]
        });
        ElMessage({
            type: 'success',
            message: '使用成功',
        })
    }).catch(() => {
        ElMessage({
            type: 'success',
            message: '已取消使用',
        })
    })
}

const useToFile = async () => {
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
    //存储数据
    let file = res.data.data;
    file.file_name = template.value.template_name;
    file.file_data = JSON.parse(JSON.stringify(template.value.template_data));
    //复制到文件
    res = await editReport(file.file_id, file);
    if (res.data.code != 1)
        return ElMessage({
            message: '创建文件失败',
            type: 'error',
        })
    let idx = files.findIndex(e => e.file_id == file.file_id);
    files[idx] = file;
    store.commit('setFileList', files);
    //跳转页面
    router.push(`/report/${file.file_id}`);
    ElMessage({
        type: 'success',
        message: '创建成功',
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
watch(autoSaveValue, (newVal, oldVal) => newVal == 0 && saveTemp());
let showAutoSave = computed(() => {
    const min = Math.floor(autoSaveValue.value / 60);
    const second = autoSaveValue.value % 60;
    const formattedMinutes = String(min).padStart(2, '0');
    const formattedSeconds = String(second).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
})

//上传相关
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
    template.value.template_data = res.template.template_data;
    let files = store.state.template_list;
    let idx = files.findIndex(e => e.template_id == template_id);
    files[idx] = template.value;
    store.commit('setTemplateList', files);
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
    exportTemplate(template_id, format)
        .then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            //文件名
            let file_name = template.value.template_name + '.xlsx';
            if (format == 'json') file_name = template.value.template_name + '.json';
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

.upload-button {
    display: flex;
    align-items: center;
    margin-left: 12px;
}
</style>