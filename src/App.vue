<script setup lang="ts">
import {computed, ref} from "vue";
import AsideMenu from "@/components/AsideMenu.vue";
import GoodsManage from "@/components/GoodsManage.vue";
import Welcome from "@/components/Welcome.vue";
import GoodsRecord from "@/components/GoodsRecord.vue";
import ApplyManage  from "@/components/ApplyManage.vue";
import ProduceManage from "@/components/ProduceManage.vue";
import ProduceDetail from "@/components/ProduceDetail.vue";

function openPage(data: string[]) {
    const key = data[1]
    const param = !data[2] ? "" : data[2]
    window.location.replace(`#/${key}?${param}`);
}

const routes = {
    "/":Welcome,"/Welcome": Welcome, "/GoodsManage": GoodsManage,"/GoodsRecord":GoodsRecord,"/ApplyManage":ApplyManage,
    "/ProduceManage":ProduceManage,"/ProduceDetail":ProduceDetail
}
const currentPath = ref(window.location.hash)
window.addEventListener('hashchange', () => {
    currentPath.value = window.location.hash
})
const currentView = computed(() => {
    const path = currentPath.value.slice(1).split('?')[0] || '/';
    return routes[path] || Welcome;
})
</script>

<template>
    <el-container class="main_container">
        <el-aside width="auto">
            <AsideMenu @onclick="openPage"/>
        </el-aside>
        <el-main style="display: table;padding: 0"><!--tab大小超出width但不想让排版混乱可使用如下，style="display: table;"-->
            <component :is="currentView"  @onclick="openPage"/>
        </el-main>
    </el-container>
</template>

<style>
</style>
