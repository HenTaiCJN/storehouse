<script setup lang="ts">
import {computed, getCurrentInstance, onMounted, ref} from "vue";
import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";


const {appContext: {config: {globalProperties}}} = getCurrentInstance()
const api = globalProperties.$api
const userGoodsLevel=parseInt(localStorage.getItem("storehouse_goodsLevel"))


function formatDate(dateStr: string): string {
    return new Date(dateStr).toISOString().replace('T', ' ').substring(0, 19);
}

onMounted(() => {
    init()
})

function init() {
    axios.post(`${api}/goodsApplyGet`, {
        token: localStorage.getItem('storehouse_token')
    }).then(res => {
        console.log(res);
        let tmp = []
        for (const i of res.data.msg) {
            tmp.push({
                id: i.id,
                time: formatDate(i.time),
                name: i.name,
                username: i.username,
                purpose: i.purpose,
                number: parseFloat(i.number),
                currNum: parseFloat(i["g.number"]),
                goods_id: i.goods_id,
                status: i.status,
                goodsLevel:i.goodsLevel
            })
        }
        tableData.value = tmp
    }).catch(e => {
        console.error(e);
    })
}


const tableData = ref([
    {
        id: 0,
        time: "2024-08-15 10:32:42",
        name: "巡线模块",
        username: 'nobody',
        purpose: '',
        number: 50,
        currNum: 200,
        goods_id: 1,
        status: true,
        goodsLevel:1
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

function _____() {

}

function applyAgree(row: any) {
    console.log(row);
    if (row.number > row.currNum) {
        ElMessageBox.alert('库存不足, 请检查', 'Tip', {
            confirmButtonText: '确认',
        })
        return
    }
    ElMessageBox.alert('是否确定同意申请,申请通过后库存会自动减少', '再次确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        axios.post(`${api}/applyAgree`, {
            token: localStorage.getItem('storehouse_token'),
            id: row.id,
            goods_id: row.goods_id,
            number: row.number,
            purpose: row.purpose,
        }).then(res => {
            if (res.data.status !== "200") {
                console.error(res.data.msg)
                throw new Error("API applyAgree back a error");
            }
            ElMessage({
                type: 'success',
                message: '申请通过',
            })
            init()
        })

    }).catch(() => {
        ElMessage({
            type: 'error',
            message: '申请通过失败',
        })
    })
}

function applyRefuse(row: any) {
    axios.post(`${api}/applyRefuse`, {
        token: localStorage.getItem('storehouse_token'),
        id: row.id
    }).then(res => {
        if (res.data.status !== "200") {
            console.error(res.data.msg)
            throw new Error("API applyAgree back a error");
        }
        ElMessage({
            type: 'success',
            message: '拒绝成功',
        })
        init()
    }).catch(e=>{
        console.error(e);
    })
}
</script>

<template>
    <div>
        <h1>
            申请记录
        </h1>
    </div>
    <div>
        <el-table :data="filterTableData" table-layout="auto">
            <el-table-column fixed prop="time" label="时间" sortable/>
            <el-table-column prop="name" label="名称" sortable/>
            <el-table-column prop="username" label="用户" sortable/>
            <el-table-column prop="purpose" label="用途" sortable/>
            <el-table-column prop="number" label="取用数量" sortable/>
            <el-table-column prop="currNum" label="当前存量" sortable/>
            <el-table-column fixed="right" label="操作" width="150">
                <template #header>
                    <el-input v-model="search" size="small" placeholder="搜索"/>
                </template>
                <template #default="scope">
                    <template v-if="scope.row.status ===null && userGoodsLevel>=scope.row.goodsLevel ">
                        <el-button type="success" size="small" @click="applyAgree(scope.row)">同意</el-button>
                        <el-button type="danger" size="small" @click="applyRefuse(scope.row)">拒绝</el-button>
                    </template>
                    <template v-else-if="scope.row.status ===null && userGoodsLevel<scope.row.goodsLevel ">
                        等待审批
                    </template>
                    <template v-else-if="scope.row.status">
                        <span>已同意</span>
                    </template>
                    <template v-else>
                        <span>已拒绝</span>
                    </template>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<style scoped>
.imgInTable {
    width: 100%;
}
</style>