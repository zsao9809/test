<template>
    <div class="toolbar">
        <div class="logo">
            <h1>实验报告册自动生成系统</h1>
        </div>
        <div class="user">
            <div @click="showLogin" style="margin-right: 12px;">{{ userInfo.user_name }}</div>
            <el-dropdown size="large">
                <el-avatar v-if="is_have_avatar" :key="update_avatar" :src="axios.defaults.baseURL + USERAVATAR + avatar_url + '?v=' + new Date().getTime()" />
                <el-avatar v-else src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="showLogin" v-if="!userInfo.isLogin">登录账号</el-dropdown-item>
                        <el-dropdown-item @click="showRegister" v-if="!userInfo.isLogin">注册账户</el-dropdown-item>
                        <el-dropdown-item @click="goUserInfo" v-if="userInfo.isLogin">个人主页</el-dropdown-item>
                        <el-dropdown-item @click="logout" v-if="userInfo.isLogin">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
    <el-dialog v-model="dialogLoginVisible" title="登录账户" width="800">
        <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto">
            <el-form-item label="用户名" prop="user_name">
                <el-input @keydown.enter="login(ruleFormRef)" v-model.trim="form.user_name"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="user_password">
                <el-input @keydown.enter="login(ruleFormRef)" v-model.trim="form.user_password" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item>
                <span>没有账户？
                    <el-link @click="showRegister" type="primary">去注册</el-link>
                </span>
            </el-form-item>
            <el-form-item>
                <el-button @click="showLogin">取消</el-button>
                <el-button @click="login(ruleFormRef)" type="primary">登录</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
    <el-dialog v-model="dialogRegisterVisible" title="注册账户" width="800">
        <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto">
            <el-form-item label="用户名" prop="user_name">
                <el-input v-model.trim="form.user_name"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="user_password">
                <el-input v-model.trim="form.user_password" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="user_pwd">
                <el-input v-model.trim="form.user_pwd" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item>
                <span>已有账户？
                    <el-link @click="showLogin" type="primary">去登录</el-link>
                </span>
            </el-form-item>
            <el-form-item>
                <el-button @click="showRegister">取消</el-button>
                <el-button @click="register(ruleFormRef)" type="primary">注册</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
import { getUserInfo, loginUser, logoutUser, registerUser, getSubjectList } from '@/http/api';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { englishDigitsReg, hasEnglishReg } from '@/utils/reg.js';
import axios from '@/http';
import { USERAVATAR } from '@/http/url';
import { removeCookie } from '@/utils/cookie';

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

getSubjectList().then(res => {
    if (res.data.code != 1) return;
    store.commit('setClassList', res.data.subject_list.map(e => e.subject_name));
})
getUserInfo().then(res => {
    if (res.data.code != 1) return;
    userInfo.user_name = res.data.data.user_name;
    store.commit('setUser', res.data.data);
    userInfo.isLogin = true;
})

const userInfo = reactive({
    user_name: '请登录',
    isLogin: false,
})

const form = reactive({
    user_name: '',
    user_password: '',
    user_pwd: '',
})

//登录
const login = (formEl) => {
    form.user_pwd = form.user_password;
    if (!formEl) return;
    formEl.validate(async (valid) => {
        if (valid) {
            const res = await loginUser(form);
            if (res.data.code == 0)
                return ElMessage({
                    message: res.data.msg,
                    type: 'error',
                })

            userInfo.user_name = res.data.data.user.user_name;
            userInfo.isLogin = true;

            ElMessage({
                message: '登录成功',
                type: 'success',
                duration: 1200,
                onClose() {
                    dialogLoginVisible.value = false;
                },
            })
        } else {
            ElMessage({
                message: '格式校验未通过',
                type: 'error',
            })
        }
    })
}

const validateUserName = (rule, value, cb) => {
    if (!value) return cb('请输入用户名');
    if (!hasEnglishReg(value)) return cb('用户名必须包含英文');
    if (!englishDigitsReg(value)) return cb('用户名只能为英文和数字');
    if (value.length < 3 || value.length > 8) return cb('用户名长度必须在3到8个字符之间');
    cb();
}
const validatePassWord = (rule, value, cb) => {
    if (!value) return cb('请输入密码');
    if (!englishDigitsReg(value)) return cb('密码只能为英文和数字');
    if (value.length < 6 || value.length > 16) return cb('密码长度必须在6到16个字符之间');
    cb();
}
const validatePwd = (rule, value, cb) => {
    if (!value) return cb('请再次输入密码');
    if (value != form.user_password) return cb('两次密码不一致');
    cb();
}

const ruleFormRef = ref();
const rules = reactive({
    user_name: [{ validator: validateUserName, trigger: 'blur' }],
    user_password: [{ validator: validatePassWord, trigger: 'blur' }],
    user_pwd: [{ validator: validatePwd, trigger: 'blur' }],
})

//注册
const register = (formEl) => {
    if (!formEl) return;
    formEl.validate(async (valid) => {
        if (valid) {
            const res = await registerUser(form);
            if (res.data.code == 0)
                return ElMessage({
                    message: res.data.msg,
                    type: 'error',
                })
            ElMessage({
                message: '注册成功',
                type: 'success',
                duration: 1200,
                onClose() {
                    dialogRegisterVisible.value = false;
                    login(formEl);
                },
            })
        } else {
            ElMessage({
                message: '格式校验未通过',
                type: 'error',
            })
        }
    })
}

//退出登录
const logout = async () => {
    const res = await logoutUser();
    if (res.data.code == 0)
        return ElMessage({
            message: '注销失败',
            type: 'error',
        })
    //删除 token 跟 uid
    removeCookie('token');
    store.commit('setUser', {});
    store.commit('setFileList', []);
    store.commit('setTemplateList', []);
    store.commit('setClassList', []);
    userInfo.isLogin = false;
    userInfo.user_name = '请登录';
    //清空表单
    form.user_name = ''
    form.user_password = ''
    form.user_pwd = ''
    
    ElMessage({
        message: '注销成功',
        type: 'success',
        duration: 1200,
        onClose() {
            router.push('/index/main');
        },
    })
}
const goUserInfo = () => {
    router.push('/user/index');
}

const dialogLoginVisible = ref(false);
const dialogRegisterVisible = ref(false);

const showLogin = () => {
    if (userInfo.isLogin) return;
    dialogLoginVisible.value = !dialogLoginVisible.value;
    dialogRegisterVisible.value = false;
}
const showRegister = () => {
    dialogRegisterVisible.value = !dialogRegisterVisible.value;
    dialogLoginVisible.value = false;
}
</script>

<style>
.toolbar {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    right: 20px;
}

.user {
    display: flex;
    align-items: center;
}
</style>