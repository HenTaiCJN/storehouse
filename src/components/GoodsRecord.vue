<script setup lang="ts">
import {computed, getCurrentInstance, onMounted, ref} from "vue";
import axios from "axios";


const {appContext: {config: {globalProperties}}} = getCurrentInstance()
const api = globalProperties.$api

function formatDate(dateStr: string): string {
    return new Date(dateStr).toISOString().replace('T', ' ').substring(0, 19);
}

onMounted(() => {
    init()
})

function init() {
    axios.post(`${api}/recordGet`, {
        token: localStorage.getItem('storehouse_token')
    }).then(res => {
        let tmp = []
        for (const i of res.data.msg) {
            tmp.push({
                time: formatDate(i.time),
                name: i.name,
                action: i.action,
                username: i.username,
                purpose: i.purpose,
                number: parseFloat(i.number),

                goods_id: i.goods_id,
                applyID: i.applyID
            })
        }
        tableData.value = tmp
    }).catch(e => {
        console.error(e);
    })
}


const tableData = ref([
    {
        time: "2024-08-15 10:32:42",
        name: "巡线模块",
        action: "红外",
        username: 'nobody',
        purpose: '',
        number: 200,

        goods_id: 0,
        applyID: 0
    },
])
const search = ref('')
const filterTableData = computed(() =>
    tableData.value.filter((data) =>
        !search.value ||
        Object.keys(data).some((key) =>
            String(data[key]).toLowerCase().includes(search.value.toLowerCase())
        )
    )
)
const bigImgUrl = ref('')
const bigImgDialog = ref(false)

function openBigImg(url: string) {
    bigImgUrl.value = url
    bigImgDialog.value = true
}

function _____() {

}

const detailObj = ref()
const detailDialog = ref(false)

function detailDialogOpen(row: any) {
    axios.post(`${api}/recordDetail`, {
        token: localStorage.getItem('storehouse_token'),
        goods_id: row.goods_id,
        applyID: row.applyID,
    }).then(res => {
        console.log(res.data.msg);
        if (res.data.status !== "200") {
            console.error(res.data.msg)
            throw new Error("API applyAgree back a error");
        }
        res.data.msg.goods.imgUrl="https://cloud.leihoorobot.com/w/"+res.data.msg.goods.imgUrl
        detailObj.value = res.data.msg
        detailDialog.value = true
    }).catch(e => {
        console.error(e);
    })
}

</script>

<template>
    <div>
        <h1>
            货物记录
        </h1>
    </div>
    <div>
        <el-table :data="filterTableData" table-layout="auto">
            <el-table-column fixed prop="time" label="时间" sortable/>
            <el-table-column prop="name" label="名称" sortable/>
            <el-table-column prop="action" label="行为" sortable/>
            <el-table-column prop="username" label="用户" sortable/>
            <el-table-column prop="purpose" label="用途" sortable/>
            <el-table-column prop="number" label="数量" sortable/>
            <el-table-column fixed="right" label="操作" width="150">
                <template #header>
                    <el-input v-model="search" size="small" placeholder="搜索"/>
                </template>
                <template #default="scope">
                    <el-button type="primary" size="small" @click="detailDialogOpen(scope.row)">查看详情</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <el-dialog
        v-model="bigImgDialog"
        title="图片"
        width="30%"
    >
        <el-image style="width: 100%;" :src="bigImgUrl" fit="contain"/>
    </el-dialog>
    <el-dialog
        v-model="detailDialog"
        title="详情"
        width="30%"
    >
        <div>{{"名称:"+detailObj.goods.name}}</div>
        <div>{{"类型:"+detailObj.goods.type}}</div>
        <div v-if="detailObj.applyLog!==null">{{"申请时间:"+formatDate(detailObj.applyLog.time)}}</div>
        <div>图片:</div>
        <div><img class="imgInTable" :src="detailObj.goods.imgUrl" alt="" @click="openBigImg(detailObj.goods.imgUrl)"></div>
        <div>
            <template v-if="detailObj.goods.tip===''">
                备注:无
            </template>
            <template v-else>
                {{"备注:"+detailObj.goods.tip}}
            </template>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="detailDialog=false">取消</el-button>
                <el-button type="primary" @click="detailDialog=false">确认</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>
.imgInTable {
    width:300px;
}
</style>