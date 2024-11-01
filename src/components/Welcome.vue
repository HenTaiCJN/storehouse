<script setup lang="ts">
import {getCurrentInstance, onMounted, ref} from "vue";
import axios from "axios";
import eventBus from '@/EventBus'

const {appContext: {config: {globalProperties}}} = getCurrentInstance()
const api = globalProperties.$api
const emits = defineEmits(['onclick', 'CloseAll']);


const checkList = ref()

const loginSubscribe = eventBus.subscribe('login', data => {
    init()
});

onMounted(() => {
   init()
})

function init(){
    axios.post(`${api}/inventoryCheck`, {
        token: localStorage.getItem('storehouse_token')
    }).then(res => {
        if (res.data.status == "200") {
            let tmp = []
            for (const i of res.data.msg) {
                i.threshold = i.threshold===null ? 50 : i.threshold
                tmp.push(i)
            }
            checkList.value = tmp
        }
    }).catch(e => {
        console.error(e);
    })
}

const bigImgUrl = ref('')
const bigImgDialog = ref(false)
const detailObj = ref()
const detailDialog = ref(false)

function openBigImg(url: string) {
    bigImgUrl.value = url
    bigImgDialog.value = true
}

function detailDialogOpen(item: any) {
    item.imgUrl = "https://cloud.leihoorobot.com/w/" + item.imgUrl
    detailObj.value = item
    detailDialog.value = true
}

</script>

<template>
    <div class="text-center">
        <img src="../assets/logo-a.png" alt="Logo" style="max-width: 100%; height: auto;">
        <h1>欢迎使用仓库管理系统</h1>
    </div>
    <div class="text-center">
        <el-card class="card" v-for="i in checkList" :key="i.id">
            <template #header>
                <div class="card-header">
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        :content=" i.name+'--'+ i.type "
                        placement="top"
                    >
                        <span class="ellipsis">{{ i.name }}--{{ i.type }}</span>
                    </el-tooltip>
                </div>
            </template>
            <p>现有:{{ i.number }}</p>
            <p v-if="i.number/i.threshold<0.3" style="color: red">请及时补货</p>
            <p v-else style="color:#E6A23CFF">请及时补货</p>
            <template #footer>
                <el-button type="primary" size="small" @click="detailDialogOpen(i)">查看详情</el-button>
            </template>
        </el-card>
    </div>
    <el-dialog
        v-model="detailDialog"
        title="详情"
        width="30%"
    >
        <div>{{ "名称:" + detailObj.name }}</div>
        <div>{{ "类型:" + detailObj.type }}</div>
        <div>
            <template v-if="detailObj.tip===''">
                备注:无
            </template>
            <template v-else>
                {{ "备注:" + detailObj.tip }}
            </template>
        </div>
        <div>图片:</div>
        <div><img class="imgInTable" :src="detailObj.imgUrl" alt="" @click="openBigImg(detailObj.imgUrl)">
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="detailDialog=false">取消</el-button>
                <el-button type="primary" @click="detailDialog=false">确认</el-button>
            </div>
        </template>
    </el-dialog>
    <el-dialog
        v-model="bigImgDialog"
        title="图片"
        width="30%"
    >
        <el-image style="width: 100%;" :src="bigImgUrl" fit="contain"/>
    </el-dialog>
</template>

<style scoped>
.text-center {
    text-align: center;
}

.imgInTable {
    width: 300px;
}

.card {
    display: inline-block;
    width: 300px;
    margin: auto 5px;
}

.ellipsis {
    display: inline-block; /* span 仍然是 inline-block */
    width: 100%; /* 占满父级容器的宽度 */
    white-space: nowrap; /* 不换行 */
    overflow: hidden; /* 溢出隐藏 */
    text-overflow: ellipsis; /* 超出部分用省略号表示 */
}
</style>