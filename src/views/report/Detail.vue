<template>
    <div class="work">
        <div class="header">
            <el-page-header @back="goBack" :title="report.file_name" :icon="null">
                <template #content>
                    <span class="text-large font-600 mr-3">编辑详情</span>
                </template>
                <template #extra>
                    <div class="flex items-center">
                        <el-button @click="useTemp" type="primary" class="ml-2">标准段落</el-button>
                        <el-button @click="clear" type="danger" class="ml-2">清空</el-button>
                    </div>
                </template>
            </el-page-header>
        </div>
        <div class="main">
            <el-form :model="form" label-width="auto">
                <el-form-item label="实验标题">
                    <el-input v-model="form.title" />
                </el-form-item>
                <el-form-item label="实验简介">
                    <el-input v-model="form.desc" :autosize="{ minRows: 2, maxRows: 5 }" type="textarea" />
                </el-form-item>
                <!-- 文档段落 -->
                <el-form-item label="段落设计">
                    <el-table :data="form.paragraphs" max-height="386" :border="true">
                        <el-table-column type="index" :align="'center'" />
                        <el-table-column label="段落标题" :align="'center'">
                            <template #default="para">
                                <el-input v-model="para.row.title"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="段落文本" :align="'center'">
                            <template #default="para">
                                <el-input v-model="para.row.desc" :autosize="{ minRows: 1, maxRows: 4 }"
                                    type="textarea"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" :align="'center'">
                            <template #default="para">
                                <el-button @click="addPara(para.row, para.$index)" size="small">复制</el-button>
                                <el-popconfirm @confirm="delPara(para.$index)" title="确认要删除该项吗？"
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
                    <el-button @click="addPara({ title: '', desc: '' }, -1)">添加段落</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button @click="goBack">返回</el-button>
                    <el-button type="primary" @click="onSubmit">
                        <span>保存</span>
                        <span style="margin-left: 2px;">{{ showAutoSave }}</span>
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { reactive, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { editReport, getReportInfo } from '@/http/api';

const route = useRoute();
const store = useStore();
const router = useRouter();

const index = route.params.index;
const file_id = route.params.file_id;
const report = ref({
    user_id: '',
    file_id: file_id,
    is_created: false,
    is_enable_ai: false,
    file_name: '',
    file_data: {
        class_name: '',
        tile: '',
        list: [
            {
                title: '',
                desc: '',
            }
        ]
    },
})
const form = ref({
    title: '',
    desc: '',
});

const update = () => {
    getReportInfo(file_id).then(res => {
        if (res.data.code != 1) {
            return ElMessage({
                message: '同步文件信息失败',
                type: 'error',
            })
        }
        report.value = res.data.data;
        form.value = report.value.file_data.list[index];
    })
}
const initReport = store.state.file_list.find(e => e.file_id == file_id);
if (initReport) {
    report.value = initReport;
    form.value = report.value.file_data.list[index];
} else update();


const useTemp = () => {
    ElMessageBox.confirm('使用标准段落将会清空当前段落，您确定吗？', '使用标准段落', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        form.value.paragraphs = [
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

const clear = () => {
    ElMessageBox.confirm('确定要清空当前实验报告吗？', '清空文档', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        form.value.title = '';
        form.value.desc = '';
        form.value.paragraphs = [];

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

const addPara = (e, idx) => {
    if (!form.value.paragraphs) return form.value.paragraphs = [{ ...e }];
    if (idx == -1) return form.value.paragraphs.push({ ...e });
    form.value.paragraphs.splice(idx, 0, { ...e });
}

const delPara = (idx) => {
    form.value.paragraphs.splice(idx, 1);
}

const onSubmit = async () => {
    autoSaveValue.value = 60 * 3;
    if (report.value.file_name == '')
        return ElMessage({
                message: '文件名不能为空',
                type: 'error',
            })
    
    report.value.file_data.list[index] = form.value;
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
        duration: 1100,
    })
}

const goBack = () => {
    let files = store.state.file_list;
    let idx = files.findIndex(e => e.file_id == file_id);
    report.value.file_data.list[index] = form.value;
    files[idx] = report.value;
    store.commit('setFileList', files);
    router.push(`/report/${file_id}`);
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

</script>

<style scoped >
.work {
    width: 70%;
}

.header {
    margin-bottom: 20px;
}
</style>