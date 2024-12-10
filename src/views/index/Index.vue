<template>
    <div class="common-layout">
        <el-container style="height: 100vh;">
            <el-header>
                <Header></Header>
            </el-header>
            <el-container>
                <el-aside :key="route.path" width="200px">
                    <Aside></Aside>
                </el-aside>
                <el-container>
                    <el-main :key="route.path">
                        <RouterView></RouterView>
                    </el-main>
                </el-container>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router';
import Header from '@/components/Header.vue';
import Aside from '@/components/Aside.vue';

const route = useRoute();

</script>

<style scope>
.common-layout {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.el-header {
    background-color: rgb(216.8, 235.6, 255);
    color: black;
}

.el-aside {
    background-color: white;
}

.el-main {
    background-color: rgb(243.9, 244.2, 244.8);
}

</style>
