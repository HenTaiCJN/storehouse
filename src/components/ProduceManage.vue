<script setup lang="ts">
import {computed, getCurrentInstance, h, onMounted, ref} from "vue";
import {ArrowDown, Search} from '@element-plus/icons-vue'
import {
    Action,
    ComponentSize,
    ElMessage,
    ElMessageBox,
    FormInstance,
    genFileId, UploadInstance,
    UploadProps,
    UploadRawFile
} from "element-plus";
import axios from "axios";

const {appContext: {config: {globalProperties}}} = getCurrentInstance()
const api = globalProperties.$api
const userGoodsLevel = parseInt(localStorage.getItem("storehouse_goodsLevel"))
const userPermission = parseInt(localStorage.getItem("storehouse_permission"))
const emits = defineEmits(['onclick', 'CloseAll']);

onMounted(() => {
    initProduce()
    initGoods()
    isMobileDevice()
})

function initProduce() {
    axios.post(`${api}/produce_getAll`, {
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
                zone: i.zone,
                describe:i.describe,
                videoUrl:i.video_url
            })
        }
        tableData.value = tmp
    }).catch(e => {
        console.error(e);
    })
}

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
    }).catch(e => {
        console.error(e);
    })
}
function _____(){}

const dialog_width = ref('30%')

function isMobileDevice() {
    if ((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)) {
        dialog_width.value = '80%'
    }
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


function _______() {
}

const tableData = ref([
    {
        id: 1,
        name: "巡线模块",
        type: "红外",
        goodsLevel: 1,
        imgUrl: "https://cloud.leihoorobot.com/w/assets/img/lehangkeji/108e69ceb983b6b623c5fb44c1c1cda81696491802.307376.png",
        zone: "A",
        number: 200,
        tip: '',
        describe:'',
        videoUrl:''
    },
])
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

const bigImgUrl = ref('')
const bigImgDialog = ref(false)

function openBigImg(url: string) {
    bigImgUrl.value = url
    bigImgDialog.value = true
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

function _________() {
}

function produceAdd(row: any) {
    axios.post(`${api}/produceAdd`, {
        token: localStorage.getItem('storehouse_token'),
        goodsId: row.id
    }).then(res => {
        if (res.data.status !== "200") throw new Error("API produceAdd back a error");
        ElMessage({
            type: 'success',
            message: '添加成功',
        })
        initProduce()
    }).catch(e => {
        ElMessage({
            type: 'error',
            message: '添加失败',
        })
        console.error(e);
    })
}

function produceDelete(row: any) {
    ElMessageBox.alert('确定删除该模板?', '警告', {
        confirmButtonText: '确定',
        showCancelButton:true,
        cancelButtonText: '取消',
        callback: (action: Action) => {
            if (action === 'confirm') {
                axios.post(`${api}/produceDelete`, {
                    token: localStorage.getItem('storehouse_token'),
                    produceId: row.id,
                }).then(res => {
                    if (res.data.status !== "200") {
                        ElMessageBox.alert(res.data.msg, '警告', {
                            confirmButtonText: '确定',
                        })
                        return
                    }
                    let index = tableData.value.findIndex(i => i.id === row.id)
                    tableData.value.splice(index, 1)
                    ElMessage({
                        type: 'success',
                        message: '删除成功',
                    })
                }).catch(e => {
                    ElMessage({
                        type: 'error',
                        message: '删除失败',
                    })
                    console.error(e);
                })
            }
        },
    })
}

function manage(row: any) {
    emits("onclick", ["生产详情", "ProduceDetail", `produceID=${row.id}&produceName=${row.name}`]);
}

function processEdit(row: any) {
    console.log(row);
    ElMessageBox.prompt('生产流程:', 'Tip', {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputType: "textarea",
        inputValue:row.describe
    }).then(({value}) => {
        console.log(value);
        axios.post(`${api}/produceProcessEdit`, {
            token: localStorage.getItem('storehouse_token'),
            produceId: row.id,
            describe: value
        }).then(res => {
            if (res.data.status !== "200") throw new Error("API produceProcessEdit back a error");
            let index=tableData.value.findIndex(i => i.id === row.id)
            tableData.value[index].describe = value
            ElMessage({type: 'success',message: '保存成功',})
        }).catch(e => {
            ElMessage({type: 'error',message: '保存失败',})
            console.error(e);
        })
    }).catch(()=>{
        return
    })
}
//视频上传
let currId=-1
const videoDialog = ref(false)
const videoList=ref([])
const upload_data = {token: localStorage.getItem('storehouse_token')}
const upload = ref<UploadInstance>()

function videoDialogOpen(row:any){
    videoDialog.value = true;
    currId=row.id;
}
function videoDialogInit(){
    videoDialog.value=false
    upload.value!.clearFiles()
}

const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}

const submitUpload = () => {
    upload.value!.submit()
}
function handleVideoSuccess(response: any){
    if (response.status !== "200") {
        ElMessage({type:"error",message:"上传失败"})
        throw new Error("API produceProcessEdit back a error")
    }
    axios.post(`${api}/produceVideoEdit`, {
        token: localStorage.getItem('storehouse_token'),
        produceId: currId,
        videoUrl: response.msg
    }).then(res => {
        if (res.data.status !== "200") throw new Error(`API produceProcessEdit back a error:\n${res.data.msg}`);
        let index=tableData.value.findIndex(i => i.id === currId)
        tableData.value[index].videoUrl = response.msg
        ElMessage({type:"success",message:"上传成功"})
    }).catch(e => {
        ElMessage({type: 'error',message: '上传失败',})
        console.error(e);
    })
}
function videoOpen(row:any){
    window.open("https://cloud.leihoorobot.com/w/"+row.videoUrl, '_blank');
}
</script>

<template>
    <div>
        <h1>
            生产管理
        </h1>
    </div>
    <div>
        <el-button class="mt-4" type="success" style="width: 100%" @click="add_dialog=true;">添加样板</el-button>
        <el-table :data="paginatedData" table-layout="auto">
            <el-table-column fixed prop="id" label="id" sortable/>
            <el-table-column prop="name" label="名称" sortable/>
            <el-table-column prop="type" label="型号" sortable/>
            <el-table-column prop="imgUrl" label="图片" width="150" sortable>
                <template #default="scope">
                    <img class="imgInTable" :src="scope.row.imgUrl"
                         alt="" @click="openBigImg(scope.row.imgUrl)"
                         loading="lazy"/>
                </template>
            </el-table-column>
            <el-table-column prop="zone" label="区域" sortable/>
            <el-table-column prop="number" label="数量" sortable/>
            <el-table-column prop="tip" label="备注" sortable/>
            <el-table-column fixed="right" label="操作">
                <template #header>
                    <el-input class="table-search" v-model="search" size="small" placeholder="搜索"/>
                </template>
                <template #default="scope">
                    <div class="dropdown-container">
                        <el-button v-if="userPermission>0"
                                   type="primary" size="small" @click="manage(scope.row)">管理
                        </el-button>
                        <el-button v-if="userPermission>0"
                                   type="warning" size="small" @click="produceDelete(scope.row)">删除
                        </el-button>
                        <el-dropdown>
                            <el-button type="success" size="small">
                                更多操作
                                <el-icon class="el-icon--right">
                                    <arrow-down/>
                                </el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item :disabled="!(userPermission>0)" @click="processEdit(scope.row)">
                                        生产流程
                                    </el-dropdown-item>
                                    <el-dropdown-item :disabled="!(userPermission>0)" @click="videoDialogOpen(scope.row)">
                                        上传视频
                                    </el-dropdown-item>
                                    <el-dropdown-item :disabled="!(userPermission>0)" @click="videoOpen(scope.row)">
                                        观看视频
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
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
        v-model="bigImgDialog"
        title="图片"
        :width="dialog_width"
    >
        <el-image style="width: 100%;" :src="bigImgUrl" fit="contain"/>
    </el-dialog>
    <el-dialog
        v-model="add_dialog"
        title="添加新样板"
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
                               type="primary" size="small" @click="produceAdd(scope.row)">
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
        v-model="videoDialog"
        title="上传视频"
        :width="dialog_width"
        :before-close="videoDialogInit"
    >
        <el-upload
            v-model:file-list="videoList"
            ref="upload"
            class="upload-demo"
            :action="`${api}/add_video_upload`"
            :limit="1"
            :on-exceed="handleExceed"
            :on-success="handleVideoSuccess"
            :auto-upload="false"
            :data="upload_data"
        >
            <template #trigger>
                <el-button type="primary">选择文件</el-button>
            </template>
            <el-button class="ml-3" type="success" @click="submitUpload">
                开始上传
            </el-button>
        </el-upload>
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

.el-button + .el-button {
    margin-left: 0;
}

.dropdown-container {
    display: flex;
    flex-wrap: wrap; /* 允许换行 */
    gap: 10px; /* 设置子元素之间的间距 */
}
</style>