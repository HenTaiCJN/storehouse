<script setup lang="ts">
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import {Search} from "@element-plus/icons-vue";
import {ComponentSize, ElMessage, ElMessageBox, FormInstance} from "element-plus";
import axios from "axios";


const {appContext: {config: {globalProperties}}} = getCurrentInstance()
const api = globalProperties.$api
const userGoodsLevel = parseInt(localStorage.getItem("storehouse_goodsLevel"))
const userPermission = parseInt(localStorage.getItem("storehouse_permission"))
const emits = defineEmits(['onclick', 'CloseAll']);


const dialog_width = ref('30%')

function isMobileDevice() {
    if ((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)) {
        dialog_width.value = '80%'
    }
}

function getHashParam(param: string): string {
    const hash = window.location.hash.slice(1); // 去掉开头的 #

    if (hash.includes('?')) {
        const queryString = hash.split('?')[1]; // 获取查询字符串
        const pairs = queryString.split('&');

        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (decodeURIComponent(key) === param) {
                return decodeURIComponent(value || '');
            }
        }
    }

    return null; // 如果没有找到参数，返回 null
}

onMounted(() => {
    isMobileDevice()
    initGoods()
})
const produceName = ref('')
let rawIdList=[]

function initGoods() {
    axios.post(`${api}/goods_get`, {
        token: localStorage.getItem('storehouse_token')
    }).then(res => {
        let tmp = []
        for (const i of res.data.msg) {
            tmp.push({
                id: i.id,
                name: i.name,
                type: i.type,
                goodsLevel: i.goodsLevel,
                imgUrl: `https://cloud.leihoorobot.com/w/${i.imgUrl}`,
                number: parseFloat(i.number),
                tip: i.tip,
                zone: i.zone
            })
            nameList.value.push({value: i.name})
        }

        searchGoods.value = tmp
        initRaw()
    }).catch(e => {
        console.error(e);
    })
}


function initRaw() {
    produceName.value =getHashParam("produceName")
    axios.post(`${api}/produce_get`, {
        token: localStorage.getItem('storehouse_token'),
        produce_id: getHashParam("produceID")
    }).then(res => {
        if (res.data.status !== "200") throw new Error("API produce_get back a error");
        tableData.value=[]
        let raw_goods=JSON.parse(res.data.msg.raw_goods)
        Object.entries(raw_goods).forEach(([key, value]) => {
            let id=parseInt(key.replaceAll("_",""))
            let index = searchGoods.value.findIndex(i => i.id === id);
            let temp=searchGoods.value[index]
            temp.require=value
            temp.children=[]
            tableData.value.push(temp)
            rawIdList.push(id)
        });

        initRawTree()

    }).catch(e => {
        console.error(e);
    })
}

function initRawTree(){
    axios.post(`${api}/rawTreeGet`, {
        token: localStorage.getItem('storehouse_token'),
        rawIdList: rawIdList
    }).then(res => {
        console.log(res);
        if (res.data.status !== "200") throw new Error("API rawTreeGet back a error");
        for (const item of res.data.msg) {
            let raw_id=item.goods_id
            let raw_goods=JSON.parse(item.raw_goods)
            Object.entries(raw_goods).forEach(([key, value]) => {
                let goods_id=parseInt(key.replaceAll("_",""))
                let index = searchGoods.value.findIndex(i => i.id === goods_id);
                let temp=searchGoods.value[index]
                temp.require=value

                let rawIndex=tableData.value.findIndex(i => i.id === raw_id);
                tableData.value[rawIndex].children.push(temp)
            });
        }
    }).catch(e => {
        console.error(e);
    })
}

const bigImgUrl = ref('')
const bigImgDialog = ref(false)

function openBigImg(url: string) {
    bigImgUrl.value = url
    bigImgDialog.value = true
}

function ______() {
}

const tableData = ref([])
const search = ref('')
const currentPage = ref(1);
const pageSize = ref(10);
const size = ref<ComponentSize>('default')
const filterTableData = computed(() => {
    return tableData.value.filter((data) =>
        !search.value ||
        Object.keys(data).some((key) =>
            String(data[key]).toLowerCase().includes(search.value.toLowerCase())
        )
    );
});
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filterTableData.value.slice(start, end);
});
const filteredDataLength = computed(() => filterTableData.value.length);
const handlePageChange = (newPage: any) => {
    currentPage.value = newPage;
};
const handleSizeChange = (val: number) => {
    pageSize.value = val
}

function _____() {
}

const add_dialog = ref(false)
const add_form_ref = ref<FormInstance>()

function add_init() {
    add_dialog.value = false
    // add_form_ref.value.resetFields()
}

//自动补全
const nameSearchInput = ref("")
const nameList = ref([])
const nameSearch = (queryString: string, cb: any) => {
    const results = queryString
        ? nameList.value.filter(createFilter(queryString))
        : nameList.value
    cb(results)
}
const createFilter = (queryString: string) => {
    return (restaurant: any) => {
        return (
            restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
    }
}

function rawAdd(row: any) {
    let index=tableData.value.findIndex(i => i.id === row.id)
    if (index != -1) {
        ElMessage({type:"warning",message:"已存在"})
        return
    }
    ElMessageBox.prompt('请输入数量', 'Tip', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern:
            /^(?!\s*$)(0|[1-9]\d*)(\.\d+)?$/,
        inputErrorMessage: '不为空且只能是数字或小数',
    }).then(({value}) => {
        axios.post(`${api}/rawGoodsAdd`, {
            token: localStorage.getItem('storehouse_token'),
            produceID: getHashParam("produceID"),
            goodsID: row.id,
            number: value
        }).then(res => {
            if (res.data.status !== "200") throw new Error("API rawGoodsAdd back a error");
            initRaw()
            ElMessage({type:"success",message:"添加成功"})
        }).catch(e => {
            ElMessage({type:"error",message:"添加失败"})
            console.error(e);
        });
    })
}

function rawDelete(row: any) {
    axios.post(`${api}/rawGoodsDelete`, {
        token: localStorage.getItem('storehouse_token'),
        produceID: getHashParam("produceID"),
        goodsID: row.id,
    }).then(res => {
        if (res.data.status !== "200") throw new Error("API rawGoodsAdd back a error");
        let index = tableData.value.findIndex(i => i.id === row.id);
        tableData.value.splice(index,1)
        ElMessage({type:"success",message:"删除成功"})
    }).catch(e => {
        ElMessage({type:"error",message:"删除失败"})
        console.error(e);
    });
}

function rawRequireChange(row: any) {
    ElMessageBox.prompt('请输入新的需求数量', 'Tip', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern:
            /^(?!\s*$)(0|[1-9]\d*)(\.\d+)?$/,
        inputErrorMessage: '不为空且只能是数字或小数',
    }).then(({value}) => {
        axios.post(`${api}/rawRequireChange`, {
            token: localStorage.getItem('storehouse_token'),
            produceID: getHashParam("produceID"),
            goodsID: row.id,
            number: value
        }).then(res => {
            if (res.data.status !== "200") throw new Error("API rawGoodsAdd back a error");
            let index = tableData.value.findIndex(i => i.id === row.id);
            tableData.value[index].require=value
            ElMessage({type:"success",message:"添加成功"})
        }).catch(e => {
            ElMessage({type:"error",message:"添加失败"})
            console.error(e);
        });
    }).catch(()=>{
        return
    })
}

function ________() {
}

const searchGoods = ref([])
const currentPageSearch = ref(1);
const pageSizeSearch = ref(5);
const sizeSearch = ref<ComponentSize>('small')
const filterSearchGoods = computed(() => {
    return !nameSearchInput.value ? [] : searchGoods.value.filter((data) =>
        Object.keys(data).some((key) =>
            String(data[key]).toLowerCase().includes(nameSearchInput.value.toLowerCase())
        )
    );
});

const paginatedDataSearch = computed(() => {
    const start = (currentPageSearch.value - 1) * pageSizeSearch.value;
    const end = start + pageSizeSearch.value;
    return filterSearchGoods.value.slice(start, end);
});
const filteredDataLengthSearch = computed(() => filterSearchGoods.value.length);
const handleSearchPageChange = (newPage: any) => {
    currentPageSearch.value = newPage;
};
const handleSearchSizeChange = (val: number) => {
    pageSizeSearch.value = val
}
function _________(){}

let curRow = {id: -1, number: -1, goodsLevel: -1}
const goodsOutDialog = ref(false)
const out_form_ref = ref<FormInstance>()
const out_form = reactive({number: null, purpose: null})
const out_form_rules = reactive({
    purpose: [
        {required: true, message: '请填写用途', trigger: 'blur'},
    ],
    number: [
        {required: true, message: '请填写数量', trigger: 'blur'},
        {validator: numberCheckOut, trigger: 'change'}
    ],
})

function startGoodsOut(row: any) {
    curRow = row
    goodsOutDialog.value = true
}

function goodsOutDialogInit() {
    goodsOutDialog.value = false
    out_form_ref.value.resetFields()
}

function numberCheckOut(rule: any, value: any, callback: any) {
    const regex = /^\d+(\.\d+)?$/;
    if (!regex.test(value)) callback(new Error('请输入正确的数字'));
    let newValue = parseFloat(value)
    if (newValue > curRow.number) callback(new Error('请输入正确的数字'));
    callback();
}

function numberCheckIn(rule: any, value: any, callback: any) {
    const regex = /^\d+(\.\d+)?$/;
    if (!regex.test(value)) callback(new Error('请输入正确的数字'));
    callback();
}

async function out_form_check(formEl: FormInstance | undefined) {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            goodsOut()
        } else {
            console.error('error submit!', fields)
            return
        }
    })
}

function goodsOut() {
    axios.post(`${api}/goodsOut`, {
        token: localStorage.getItem('storehouse_token'),
        goodsId: curRow.id,
        number: parseFloat(out_form.number),
        purpose: out_form.purpose
    }).then(res => {
        if (res.data.status !== "200") {
            console.error(res.data.msg)
            throw new Error("API goodsOut back a error");
        }
        let index = tableData.value.findIndex(i => i.id === curRow.id)
        tableData.value[index].number -= parseFloat(out_form.number)

        goodsOutDialogInit()

        ElMessage({
            type: 'success',
            message: '出货成功',
        })
    }).catch(e => {
        console.error(e);
        ElMessage({
            type: 'error',
            message: '出货失败',
        })
    })
}

</script>

<template>
    <div>
        <h1>
            生产管理>{{ produceName }}
        </h1>
    </div>
    <div>
        <el-button class="mt-4" type="success" style="width: 100%" @click="add_dialog=true;">添加原料</el-button>
        <el-table :data="paginatedData" table-layout="auto" empty-text="请添加原料" row-key="id" stripe :indent="64">
            <el-table-column prop="name" label="名称" sortable/>
            <el-table-column prop="type" label="型号" sortable/>
            <el-table-column prop="imgUrl" label="图片" width="150" sortable>
                <template #default="scope">
                    <img class="imgInTable" :src="scope.row.imgUrl"
                         alt="" @click="openBigImg(scope.row.imgUrl)" height="150"
                         loading="lazy"/>
                </template>
            </el-table-column>
            <el-table-column prop="number" label="库存" sortable/>
            <el-table-column prop="tip" label="备注" sortable/>
            <el-table-column prop="require" label="需求" sortable/>
            <el-table-column fixed="right" label="操作">
                <template #header>
                    <el-input class="table-search" v-model="search" size="small" placeholder="搜索"/>
                </template>
                <template #default="scope">
                    <div class="dropdown-container">
                        <el-button v-if="userPermission>0 && userGoodsLevel>=scope.row.goodsLevel"
                                   type="primary" size="small" @click="startGoodsOut(scope.row)">出库
                        </el-button>

                        <el-button v-if="userPermission>0"
                                   type="primary" size="small" @click="rawRequireChange(scope.row)">修改需求
                        </el-button>
                        <el-button v-if="userPermission>0"
                                   type="danger" size="small" @click="rawDelete(scope.row)">删除
                        </el-button>
                    </div>

                </template>
            </el-table-column>

        </el-table>

        <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[10, 50, 100, 150]"
            :size="size"
            :total="filteredDataLength"
            layout="sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
            background
        />
    </div>
    <el-dialog
        v-model="add_dialog"
        title="添加新原料"
        :width="dialog_width"
        :before-close="add_init"
    >
        <el-autocomplete
            v-model="nameSearchInput"
            :fetch-suggestions="nameSearch"
            :trigger-on-focus="false"
            :debounce="100"
            clearable
            class="inline-input w-50"
            style="width: 240px"
            placeholder="搜索货物"
            :prefix-icon="Search"
        />
        <el-table :data="paginatedDataSearch"
                  empty-text="请搜索"
                  :width="dialog_width"
        >
            <el-table-column prop="name" label="名称" sortable/>
            <el-table-column prop="type" label="型号" sortable/>
            <el-table-column prop="imgUrl" label="图片" width="150" sortable>
                <template #default="scope">
                    <img class="imgInTable" :src="scope.row.imgUrl"
                         alt="" @click="openBigImg(scope.row.imgUrl)"
                         loading="lazy"/>
                </template>
            </el-table-column>
            <el-table-column prop="number" label="数量" sortable/>
            <el-table-column prop="tip" label="备注" sortable/>
            <el-table-column fixed="right" label="操作">
                <template #default="scope">
                    <el-button v-if="userPermission>0 && userGoodsLevel>=scope.row.goodsLevel"
                               type="primary" size="small" @click="rawAdd(scope.row)">
                        添加
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            :current-page="currentPageSearch"
            :page-size="pageSizeSearch"
            :page-sizes="[5, 10, 20, 50]"
            :size="sizeSearch"
            :total="filteredDataLengthSearch"
            :pager-count="5"
            layout="prev, pager, next, jumper"
            @current-change="handleSearchPageChange"
            @size-change="handleSearchSizeChange"
            background
        />
    </el-dialog>
    <el-dialog
        v-model="bigImgDialog"
        title="图片"
        :width="dialog_width"
    >
        <el-image style="width: 100%;" :src="bigImgUrl" fit="contain"/>
    </el-dialog>
    <el-dialog
        v-model="goodsOutDialog"
        title="出库"
        :width="dialog_width"
        :before-close="goodsOutDialogInit"
    >
        <el-form :model="out_form" :rules="out_form_rules" ref="out_form_ref">
            <el-form-item prop="number" label="出库数量">
                <el-input-number v-model="out_form.number"/>
            </el-form-item>
            <el-form-item prop="purpose" label="用途">
                <el-input type="textarea" v-model="out_form.purpose" placeholder="请简略地写明用途"
                          show-word-limit maxlength="150"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="goodsOutDialogInit">取消</el-button>
                <el-button type="primary" @click="out_form_check(out_form_ref)">确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>
.imgInTable {
    width: 100%;
}

.el-pagination {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}
</style>