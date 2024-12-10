<template>
    <el-empty >
        <el-button @click="goHome" type="primary">返回主页</el-button>
    </el-empty>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    router.push('/');
}

</script>