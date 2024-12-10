<template>
    <div class="work">
        <div class="header">
            <el-page-header @back="goHome" title="主页" :icon="null">
                <template #content>
                    个人主页
                </template>
            </el-page-header>
        </div>
        <div class="main">
            <el-form ref="userRuleFormRef" :model="user_form" :rules="userRules" label-width="auto">
                <el-form-item style="margin-bottom: 0;">
                    <div class="user_avatar">
                        <el-upload :action="axios.defaults.baseURL + UPLOADAVATAR"
                        :headers="{'Authorization': 'Bearer ' + store.state.token}"
                        :on-success="onAvatarSuccess" :on-error="onAvatarError" :before-upload="beforeAvatarUpload"
                        accept=".jpg, .png" :show-file-list="false">
                            <el-avatar v-if="is_have_avatar" :key="update_avatar" :size="70" :src="axios.defaults.baseURL + USERAVATAR + avatar_url + '?v=' + new Date().getTime()" />
                            <el-avatar v-else :size="70" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                        </el-upload>
                    </div>
                </el-form-item>
                <el-form-item label="用户名">
                    <el-input disabled v-model="user_form.user_name" />
                </el-form-item>
                <el-form-item label="年龄" prop="user_age">
                    <el-input v-model.number="user_form.user_age" />
                </el-form-item>
                <el-form-item label="性别">
                    <el-radio-group v-model="user_form.user_gender">
                        <el-radio value="男">男</el-radio>
                        <el-radio value="女">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="联系电话" prop="user_phone">
                    <el-input v-model="user_form.user_phone" />
                </el-form-item>
                <el-form-item label="邮箱" prop="user_email">
                    <el-input v-model="user_form.user_email" />
                </el-form-item>
                <el-form-item>
                    <el-button @click="goHome">取消</el-button>
                    <el-button type="primary" @click="onSubmit(userRuleFormRef)">保存</el-button>
                    <el-button type="warning" @click="showPassword" style="margin-left: auto;">修改密码</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
    <el-dialog v-model="dialogPasswordVisible" title="修改密码" width="800">
        <el-form ref="pwdRuleFormRef" :model="pwd_form" :rules="pwdRules" label-width="auto">
            <el-form-item label="原密码" prop="old_pwd">
                <el-input v-model.trim="pwd_form.old_pwd" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="new_pwd">
                <el-input v-model.trim="pwd_form.new_pwd" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="renew_pwd">
                <el-input v-model.trim="pwd_form.renew_pwd" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="showPassword">取消</el-button>
                <el-button @click="changePwd(pwdRuleFormRef)" type="primary">修改</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
import { getUserInfo, editUser, changePassword } from '@/http/api';
import { ElMessage } from 'element-plus';
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/http'
import { ageReg, emailReg, englishDigitsReg, phoneReg } from '@/utils/reg';
import { UPLOADAVATAR, USERAVATAR } from '@/http/url';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

const is_have_avatar = computed(() => {
    return store.state.user.is_have_avatar;
})
const avatar_url = computed(() => {
    return store.state.user.user_id;
})
const update_avatar = computed(() => {
    return store.state.update_avatar;
})

//用户数据
let user_form = ref({
    user_name: '',
    user_age: 18,
    user_gender: '',
    user_phone: '',
    user_email: '',
});
//修改密码表单
let pwd_form = ref({
    old_pwd: '',
    new_pwd:'',
    renew_pwd: '',
});
getUserInfo().then(res => {
    delete res.data.data.user_id;
    delete res.data.data.file_list;
    delete res.data.data.is_have_avatar;
    user_form.value = res.data.data;
    console.log(user_form.value);
})

//保存
const onSubmit = async (formEl) => {
    if (!formEl) return;
    formEl.validate(async (valid) => {
        if (valid) {
            editUser(user_form.value)
                .then(res => {
                    if (res.data.code != 1)
                        return ElMessage({
                            message: res.data.msg,
                            type: 'error'
                        })
                    ElMessage({
                        message: res.data.msg,
                        type: 'success',
                    })
                })
        } else {
            ElMessage({
                message: '格式校验未通过',
                type: 'error',
            })
        }
    })
}

const changePwd = async (formEl) => {
    if (!formEl) return;
    formEl.validate(async (valid) => {
        if (valid) {
            changePassword(pwd_form.value)
                .then(res => {
                    if (res.data.code != 1)
                        return ElMessage({
                            message: res.data.msg,
                            type: 'error'
                        })
                    ElMessage({
                        message: res.data.msg,
                        type: 'success',
                        duration: 1200,
                        onClose() {
                            dialogPasswordVisible.value = false;
                        },
                    })
                })
        } else {
            ElMessage({
                message: '格式校验未通过',
                type: 'error',
            })
        }
    })
}

//头像相关
const beforeAvatarUpload = (file) => {
    if (file.type != 'image/jpeg' && file.type != 'image/png') {
        ElMessage.error('请选择jpg或png格式头像');
        return false;
    } else if (file.size / 1024 / 1024 > 2) {
        ElMessage.error('头像不能大于2MB');
        return false;
    }
    return true
}
const onAvatarSuccess = (res) => {
    store.commit('setUser', res.data);
    store.commit('updateAvatar');
    ElMessage({
        message: res.msg,
        type: 'success',
    })
}
const onAvatarError = (res) => {
    ElMessage({
        message: res.msg,
        type: 'error',
    })
}

const validateAge = (rule, value, cb) => {
    if (!ageReg(value)) return cb('请输入正确的年龄');
    cb();
}
const validatePhone = (rule, value, cb) => {
    if (value.length == 0) return cb();
    if (!phoneReg(value)) return cb('请输入正确的手机号');
    cb();
}
const validateEmail = (rule, value, cb) => {
    if (value.length == 0) return cb();
    if (!emailReg(value)) return cb('请输入正确的邮箱');
    cb();
}
const validatePwd = (rule, value, cb) => {
    if (value.length == 0) return cb();
    if (!englishDigitsReg(value)) return cb('密码只能为英文和数字');
    if (value.length < 6 || value.length > 16) return cb('密码长度必须在6到16个字符之间');
    cb();
}
const validateNewPwd = (rule, value, cb) => {
    if (value.length == 0) return cb();
    if (!englishDigitsReg(value)) return cb('密码只能为英文和数字');
    if (value.length < 6 || value.length > 16) return cb('密码长度必须在6到16个字符之间');
    cb();
}
const validateReNewPwd = (rule, value, cb) => {
    if (value.length == 0) return cb();
    if (value != pwd_form.value.new_pwd) return cb('两次密码不一致');
    cb();
}

const userRuleFormRef = ref();
const userRules = reactive({
    user_age: [{ validator: validateAge, trigger: 'blur' }],
    user_phone: [{ validator: validatePhone, trigger: 'blur' }],
    user_email: [{ validator: validateEmail, trigger: 'blur' }],
})

const pwdRuleFormRef = ref();
const pwdRules = reactive({
    old_pwd: [{ validator: validatePwd, trigger: 'blur' }],
    new_pwd: [{ validator: validateNewPwd, trigger: 'blur' }],
    renew_pwd: [{ validator: validateReNewPwd, trigger: 'blur' }],
})

const dialogPasswordVisible = ref(false);
const showPassword = () => {
    dialogPasswordVisible.value = !dialogPasswordVisible.value;
}

const goHome = () => {
    router.push('/index/main');
}

</script>

<style scoped>
.work {
    width: 70%;
}

.header {
    margin-bottom: 20px;
}

.user_avatar {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>