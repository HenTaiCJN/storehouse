<script setup lang="ts">
import {ref, shallowRef} from "vue";
import AsideMenu from "@/components/AsideMenu.vue";
import GoodsManage from "@/components/GoodsManage.vue";
import Welcome from "@/components/Welcome.vue";
import GoodsRecord from "@/components/GoodsRecord.vue";
import ApplyManage  from "@/components/ApplyManage.vue";

const pages = {
    "Welcome": Welcome, "GoodsManage": GoodsManage,"GoodsRecord":GoodsRecord,"ApplyManage":ApplyManage
}
const currPage = shallowRef(Welcome)

function openPage(data: string[]) {
    let key = data[1]
    currPage.value = pages[key]
}
</script>

<template>
    <el-container class="main_container">
        <el-aside width="auto">
            <AsideMenu @onclick="openPage"/>
        </el-aside>
        <el-main style="display: table;padding: 0"><!--tab大小超出width但不想让排版混乱可使用如下，style="display: table;"-->
            <component :is="currPage"/>
        </el-main>
    </el-container>
</template>

<style>
</style>
