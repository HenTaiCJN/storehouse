<script setup lang="ts">
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import {ArrowDown, Plus} from '@element-plus/icons-vue'
import {Action, ComponentSize, ElMessage, ElMessageBox, FormInstance, UploadProps} from "element-plus";
import axios from "axios";

const {appContext: {config: {globalProperties}}} = getCurrentInstance()
const api = globalProperties.$api
const imgPrefix = "https://cloud.leihoorobot.com/w/"
const userGoodsLevel = parseInt(localStorage.getItem("storehouse_goodsLevel"))
const userPermission = parseInt(localStorage.getItem("storehouse_permission"))
const emits = defineEmits(['onclick', 'CloseAll']);

onMounted(() => {
    init()
    isMobileDevice()
})

function init() {
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
                imgUrl: i.imgUrl,
                number: parseFloat(i.number),
                tip: i.tip,
                zone: i.zone,
                threshold: i.threshold,
            })
            nameList.value.push({value: i.name})
            typeList.value.push({value: i.type})
            similarList.push({name: i.name, type: i.type})
        }

        tableData.value = tmp
    }).catch(e => {
        console.error(e);
    })
}

const dialog_width = ref('30%')

function isMobileDevice() {
    if ((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)) {
        dialog_width.value = '80%'
    }
}

const add_dialog = ref(false)
const add_form_btn = ref(true)
const add_form_ref = ref<FormInstance>()
const add_form = reactive({
    name: "",
    type: "",
    goodsLevel: 1,
    img: [],
    zone: "",
    number: null,
    tip: "",
    threshold: "50"
})
const add_form_rules = reactive({
    name: [
        {required: true, message: '请输入标题', trigger: 'blur'},
    ],
    type: [
        {required: true, message: '请填写类型', trigger: 'blur'},
    ],
    goodsLevel: [
        {required: true, message: '请选择物品等级', trigger: 'blur'},
    ],
    img: [
        {required: true, message: '请上传文件', trigger: 'blur'},
        {validator: checkImgLength, trigger: 'change'}
    ],
    zone: [
        {required: true, message: '请选择存放区域', trigger: 'blur'},
    ],
    number: [
        {required: true, message: '请填写数量', trigger: 'blur'},
    ],
    threshold: [
        {required: true, message: '请填写阈值', trigger: 'blur'},
    ],
})
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const goodsLevel = [{label: '正常', value: 1}, {label: "高", value: 2}];


//图片上传
const upload_url = `${api}/add_img_upload`
const upload_data = {token: localStorage.getItem('storehouse_token')}
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

function upload_error(e: any) {
    console.error(e)
    add_form.img = null
    ElMessage({type: "error", message: "图片上传失败"})
    add_form_btn.value = false
    info_form_btn.value = false
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
    dialogImageUrl.value = uploadFile.url!
    dialogVisible.value = true
}

function checkImgLength(rule: any, value: any, callback: any) {
    if (value.length > 1) {
        callback(new Error('封面只能有一张'));
    } else {
        callback();
    }
}

async function add_form_check(formEl: FormInstance | undefined) {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            add()
        } else {
            console.error('error submit!', fields)
            return
        }
    })
}

function add() {
    let similarFind = similarList.find(i => i.name === add_form.name && i.type === add_form.type)
    if (similarFind) {
        ElMessageBox.alert(
            '同名同类型的货物已经存在,请检查',
            '警告',
            {
                confirmButtonText: '确认',
                type: 'warning',
            }
        )
        return
    }

    axios.post(`${api}/goods_add`, {
        token: localStorage.getItem('storehouse_token'),
        name: add_form.name,
        type: add_form.type,
        goodsLevel: add_form.goodsLevel,
        imgUrl: add_form.img[0].response.msg,
        number: add_form.number,
        threshold: add_form.threshold,
        tip: add_form.tip,
        zone: add_form.zone
    }).then((res) => {
        if (res.data.status !== "200") {
            ElMessage({type: "error", message: "登录失效,请重新登陆"})
            return
        }
        tableData.value.push({
            id: res.data.msg.id,
            name: add_form.name,
            type: add_form.type,
            goodsLevel: add_form.goodsLevel,
            imgUrl: add_form.img[0].response.msg,
            number: add_form.number,
            tip: add_form.tip,
            zone: add_form.zone
        })

        similarList.push({name: add_form.name, type: add_form.type})
        nameList.value.push({value: add_form.name})
        typeList.value.push({value: add_form.type})

        add_form_ref.value.resetFields()
        add_dialog.value = false
    }).catch((e) => {
        console.error(e)
    })
}

function add_init() {
    add_dialog.value = false
    add_form_ref.value.resetFields()
}

//自动补全
const nameList = ref([])
const nameSearch = (queryString: string, cb: any) => {
    const results = queryString
        ? nameList.value.filter(createFilter(queryString))
        : nameList.value
    cb(results)
}
const typeList = ref([])
const typeSearch = (queryString: string, cb: any) => {
    const results = queryString
        ? typeList.value.filter(createFilter(queryString))
        : typeList.value
    cb(results)
}
const createFilter = (queryString: string) => {
    return (restaurant: any) => {
        return (
            restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
    }
}
let similarList = []

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
        tip: ''
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

const goodsInDialog = ref(false)
const in_form_ref = ref<FormInstance>()
const in_form = reactive({number: null, purpose: null})
const in_form_rules = reactive({
    purpose: [],
    number: [
        {required: true, message: '请填写数量', trigger: 'blur'},
        {validator: numberCheckIn, trigger: 'change'}
    ],
})

function startGoodsIn(row: any) {
    curRow = row
    goodsInDialog.value = true
}

function goodsInDialogInit() {
    goodsInDialog.value = false
    in_form_ref.value.resetFields()
}

async function in_form_check(formEl: FormInstance | undefined) {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            goodsIn()
        } else {
            console.error('error submit!', fields)
            return
        }
    })
}


function goodsIn() {
    axios.post(`${api}/goodsIn`, {
        token: localStorage.getItem('storehouse_token'),
        goodsId: curRow.id,
        number: parseFloat(in_form.number),
        purpose: in_form.purpose
    }).then(res => {
        if (res.data.status !== "200") {
            console.error(res.data.msg)
            throw new Error("API goodsOut back a error");
        }
        let index = tableData.value.findIndex(i => i.id === curRow.id)
        tableData.value[index].number += parseFloat(in_form.number)

        goodsInDialogInit()

        ElMessage({
            type: 'success',
            message: '入库成功',
        })
    }).catch(e => {
        console.error(e);
        ElMessage({
            type: 'error',
            message: '入库失败',
        })
    })
}

function _________() {
}

const goodsApplyDialog = ref(false)
const apply_form_ref = ref<FormInstance>()
const apply_form = reactive({number: null, purpose: null})
const apply_form_rules = reactive({
    purpose: [
        {required: true, message: '请填写用途', trigger: 'blur'},
    ],
    number: [
        {required: true, message: '请填写数量', trigger: 'blur'},
        {validator: numberCheckOut, trigger: 'change'}
    ],
})

function startGoodsApply(row: any) {
    curRow = row
    goodsApplyDialog.value = true
}

function goodsApplyDialogInit() {
    goodsApplyDialog.value = false
    apply_form_ref.value.resetFields()
}

async function apply_form_check(formEl: FormInstance | undefined) {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            goodsApply()
        } else {
            console.error('error submit!', fields)
            return
        }
    })
}

function goodsApply() {
    axios.post(`${api}/goodsApply`, {
        token: localStorage.getItem('storehouse_token'),
        goodsId: curRow.id,
        number: parseFloat(apply_form.number),
        purpose: apply_form.purpose,
        goodsLevel: curRow.goodsLevel
    }).then(res => {
        if (res.data.status !== "200") {
            console.error(res.data.msg)
            throw new Error("API goodsApply back a error");
        }
        ElMessage({
            type: 'success',
            message: '申请成功',
        })
        goodsApplyDialogInit()
    }).catch(e => {
        console.error(e);
        ElMessage({
            type: 'error',
            message: '申请失败',
        })
    })
}

function goodsDelete(row: any) {
    ElMessageBox.alert('确定删除该货物?', '警告', {
        confirmButtonText: '确定',
        callback: (action: Action) => {
            if (action === 'confirm') {
                axios.post(`${api}/goodsDelete`, {
                    token: localStorage.getItem('storehouse_token'),
                    goodsId: row.id,
                }).then(res => {
                    if (res.data.status !== "200") {
                        ElMessageBox.alert(res.data.msg, '警告', {
                            confirmButtonText: '确定',
                        })
                        return
                    }
                    let index = tableData.value.findIndex(i => i.id === row.id)
                    tableData.value.splice(index, 1)
                    index = similarList.findIndex(i => i.name === row.name && i.type === row.type)
                    similarList.splice(index, 1)
                    ElMessage({
                        type: 'success',
                        message: '删除成功',
                    })
                }).catch(e => {
                    console.error(e);
                })
            }
        },
    })
}

function thresholdChange(row: any) {
    ElMessageBox.prompt('输入新的提醒阈值', 'Tip', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern:
            /^\d+(\.\d+)?$/,
        inputErrorMessage: '请输入数字',
    }).then(({value}) => {
        axios.post(`${api}/goodsThresholdChange`, {
            token: localStorage.getItem('storehouse_token'),
            goodsId: row.id,
            threshold: value,
        }).then(res => {
            if (res.data.status !== "200") return
            ElMessage({
                type: 'success',
                message: '修改成功',
            })
        }).catch(e => {
            ElMessage({
                type: 'error',
                message: '修改失败',
            })
            console.error(e);
        })
    }).catch((e) => {
        console.log(e);
    })
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
    }).catch(e => {
        ElMessage({
            type: 'error',
            message: '添加失败',
        })
        console.error(e);
    })
}

let oldInfo
const infoChangeDialog = ref(false)
const info_form_btn = ref(true)
const info_form_ref = ref<FormInstance>()
const info_form = reactive({
    id: null,
    name: "",
    type: "",
    goodsLevel: 1,
    img: [],
    zone: "",
    tip: "",
    threshold: "50"
})
const info_form_rules = reactive({
    name: [
        {required: true, message: '请输入标题', trigger: 'blur'},
    ],
    type: [
        {required: true, message: '请填写类型', trigger: 'blur'},
    ],
    goodsLevel: [
        {required: true, message: '请选择物品等级', trigger: 'blur'},
    ],
    img: [
        {required: true, message: '请上传文件', trigger: 'blur'},
        {validator: checkImgLength, trigger: 'change'}
    ],
    zone: [
        {required: true, message: '请选择存放区域', trigger: 'blur'},
    ],
    threshold: [
        {required: true, message: '请填写阈值', trigger: 'blur'},
    ],
})

async function info_form_check(formEl: FormInstance | undefined) {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            infoChange()
        } else {
            console.error('error submit!', fields)
            return
        }
    })
}

function infoChangeInit(row: any) {
    oldInfo=row
    info_form_btn.value = false
    console.log(row);
    info_form.id = row.id
    info_form.name = row.name
    info_form.type = row.type
    info_form.goodsLevel = row.goodsLevel
    info_form.tip = row.tip
    info_form.zone = row.zone
    info_form.threshold = row.threshold === null ? 50 : row.threshold
    info_form.img[0] = {name: "old", url: imgPrefix + row.imgUrl,oriUrl: row.imgUrl}

    infoChangeDialog.value = true

}

function infoChange() {
    console.log(info_form.img);
    if(oldInfo.name !==info_form.name && oldInfo.type!==info_form.type) {
        let similarFind = similarList.find(i => i.name === info_form.name && i.type === info_form.type)
        if (similarFind) {
            ElMessageBox.alert(
                '同名同类型的货物已经存在,请检查',
                '警告',
                {
                    confirmButtonText: '确认',
                    type: 'warning',
                }
            )
            return
        }
    }

    axios.post(`${api}/goodsInfoChange`, {
        token: localStorage.getItem('storehouse_token'),
        goodsId: info_form.id,
        name: info_form.name,
        goodsType: info_form.type,
        goodsLevel: info_form.goodsLevel,
        imgUrl: info_form.img[0].response ? info_form.img[0].response.msg : info_form.img[0].oriUrl,
        threshold: info_form.threshold,
        tip: info_form.tip,
        zone: info_form.zone
    }).then((res) => {
        if (res.data.status !== "200") {
            ElMessage({type: "error", message: "登录失效,请重新登陆"})
            return
        }
        const index=tableData.value.findIndex(i => i.id === info_form.id);
        tableData.value[index]={
            id: info_form.id,
            name: info_form.name,
            type: info_form.type,
            goodsLevel: info_form.goodsLevel,
            imgUrl: info_form.img[0].response ? info_form.img[0].response.msg : info_form.img[0].oriUrl,
            number: tableData.value[index].number,
            tip: info_form.tip,
            zone: info_form.zone
        }

        similarList.push({name: info_form.name, type: info_form.type})
        nameList.value.push({value: info_form.name})
        typeList.value.push({value: info_form.type})

        info_form_ref.value.resetFields()
        infoChangeDialog.value = false
    }).catch((e) => {
        console.error(e)
    })
}

</script>

<template>
    <div>
        <h1>
            货物管理
        </h1>
    </div>
    <div>
        <el-button class="mt-4" type="success" style="width: 100%" @click="add_dialog=true;">添加新货物</el-button>
        <el-table :data="paginatedData" table-layout="auto">
            <el-table-column fixed prop="id" label="id" sortable/>
            <el-table-column prop="name" label="名称" sortable/>
            <el-table-column prop="type" label="型号" sortable/>
            <el-table-column prop="imgUrl" label="图片" width="150" sortable>
                <template #default="scope">
                    <img class="imgInTable" :src="imgPrefix+scope.row.imgUrl"
                         alt="" @click="openBigImg(imgPrefix+scope.row.imgUrl)"
                         loading="lazy" :key="scope.row.imgUrl"/>
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
                        <el-button v-if="userPermission>0 && userGoodsLevel>=scope.row.goodsLevel"
                                   type="primary" size="small" @click="startGoodsOut(scope.row)">出库
                        </el-button>
                        <el-button v-if="userPermission>0"
                                   type="success" size="small" @click="startGoodsIn(scope.row)">入库
                        </el-button>
                        <!--                        <el-button v-if="userPermission>0"
                                                           type="danger" size="small" @click="goodsDelete(scope.row)">删除
                                                </el-button>
                                                <el-button type="primary" size="small" @click="startGoodsApply(scope.row)">申请取货</el-button>

                                                <el-button v-if="userPermission>0"
                                                           type="warning" size="small" @click="thresholdChange(scope.row)">修改阈值
                                                </el-button>-->
                        <el-dropdown>
                            <el-button type="warning" size="small">
                                更多操作
                                <el-icon class="el-icon--right">
                                    <arrow-down/>
                                </el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item :disabled="!(userPermission>0)"
                                                      @click="infoChangeInit(scope.row)">
                                        修改信息
                                    </el-dropdown-item>
                                    <el-dropdown-item :disabled="!(userPermission>0)" @click="goodsDelete(scope.row)">
                                        删除
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="startGoodsApply(scope.row)">
                                        申请取货
                                    </el-dropdown-item>
                                    <el-dropdown-item :disabled="!(userPermission>0)"
                                                      @click="thresholdChange(scope.row)">
                                        修改阈值
                                    </el-dropdown-item>
                                    <el-dropdown-item :disabled="!(userPermission>0)" @click="produceAdd(scope.row)">
                                        添加至样板
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
        title="添加新货物"
        :width="dialog_width"
        :before-close="add_init"
    >
        <el-form :model="add_form" :rules="add_form_rules" ref="add_form_ref"
                 label-position="left"
                 label-width="80px"
                 status-icon>
            <el-form-item prop="name" label="名称">
                <el-autocomplete
                    v-model="add_form.name"
                    :fetch-suggestions="nameSearch"
                    :trigger-on-focus="false"
                    clearable
                    class="inline-input w-50"
                    placeholder="输入名称"
                />
                <!--                <el-input type="text" v-model="add_form.name" placeholder="输入名称"/>-->
            </el-form-item>
            <el-form-item prop="type" label="型号">
                <el-autocomplete
                    v-model="add_form.type"
                    :fetch-suggestions="typeSearch"
                    :trigger-on-focus="false"
                    clearable
                    class="inline-input w-50"
                    placeholder="输入型号"
                />
                <!--                <el-input type="text" v-model="add_form.type" placeholder="输入型号"/>-->
            </el-form-item>
            <el-form-item prop="number" label="数量">
                <el-input type="text" v-model="add_form.number" placeholder="输入数量"/>
            </el-form-item>
            <el-form-item prop="threshold" label="提醒阈值">
                <el-input type="text" v-model="add_form.threshold" placeholder="输入提醒阈值"/>
            </el-form-item>
            <el-form-item prop="number" label="物品等级">
                <el-select
                    v-model="add_form.goodsLevel"
                    placeholder="请选择存放区域"
                    style="width: 200px"
                >
                    <el-option
                        v-for="item in goodsLevel"
                        :key="item"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item prop="zone" label="区域">
                <el-select
                    v-model="info_form.zone"
                    placeholder="请选择存放区域"
                    style="width: 200px"
                >
                    <el-option
                        v-for="item in alphabet"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                </el-select>
            </el-form-item>
            <el-form-item prop="img" label="图片">
                <el-upload
                    v-model:file-list="info_form.img"
                    capture="environment"
                    :action="upload_url"
                    list-type="picture-card"
                    :on-preview="handlePictureCardPreview"
                    :on-success="()=> {add_form_btn=false;console.log(add_form.img)}"
                    :on-error="upload_error"
                    :on-progress="()=> {add_form_btn=true}"
                    :data="upload_data"
                >
                    <el-icon>
                        <Plus/>
                    </el-icon>
                </el-upload>
            </el-form-item>
            <el-form-item prop="tip" label="备注">
                <el-input type="textarea" v-model="add_form.tip" placeholder="无法以个数统计的可以在此注明单位"
                          show-word-limit maxlength="150"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="add_init">取消</el-button>
                <el-button type="primary" @click="add_form_check(add_form_ref)" :disabled="add_form_btn">确认
                </el-button>
            </div>
        </template>
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
    <el-dialog
        v-model="goodsInDialog"
        title="入库"
        :width="dialog_width"
        :before-close="goodsInDialogInit"
    >
        <el-form :model="in_form" :rules="in_form_rules" ref="in_form_ref">
            <el-form-item prop="number" label="入库数量">
                <el-input-number v-model="in_form.number"/>
            </el-form-item>
            <el-form-item prop="purpose" label="备注">
                <el-input type="textarea" v-model="in_form.purpose" show-word-limit maxlength="150"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="goodsInDialogInit">取消</el-button>
                <el-button type="primary" @click="in_form_check(in_form_ref)">确认
                </el-button>
            </div>
        </template>
    </el-dialog>
    <el-dialog
        v-model="goodsApplyDialog"
        title="取货申请"
        :width="dialog_width"
        :before-close="goodsApplyDialogInit"
    >
        <el-form :model="apply_form" :rules="apply_form_rules" ref="apply_form_ref">
            <el-form-item prop="number" label="取货数量">
                <el-input-number v-model="apply_form.number"/>
            </el-form-item>
            <el-form-item prop="purpose" label="用途">
                <el-input type="textarea" v-model="apply_form.purpose" placeholder="请简略地写明用途"
                          show-word-limit maxlength="150"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="goodsApplyDialogInit">取消</el-button>
                <el-button type="primary" @click="apply_form_check(apply_form_ref)">确认
                </el-button>
            </div>
        </template>
    </el-dialog>
    <el-dialog
        v-model="infoChangeDialog"
        title="更新信息"
        :width="dialog_width"
        :before-close="goodsApplyDialogInit"
    >
        <el-form :model="info_form" :rules="info_form_rules" ref="info_form_ref"
                 label-position="left"
                 label-width="80px"
                 status-icon>
            <el-form-item prop="name" label="名称">
                <el-input type="text" v-model="info_form.name" placeholder="输入名称"/>
            </el-form-item>
            <el-form-item prop="type" label="型号">
                <el-input type="text" v-model="info_form.type" placeholder="输入型号"/>
            </el-form-item>
            <el-form-item prop="threshold" label="提醒阈值">
                <el-input type="text" v-model="info_form.threshold" placeholder="输入提醒阈值"/>
            </el-form-item>
            <el-form-item prop="number" label="物品等级">
                <el-select
                    v-model="info_form.goodsLevel"
                    placeholder="请选择存放区域"
                    style="width: 200px"
                >
                    <el-option
                        v-for="item in goodsLevel"
                        :key="item"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item prop="zone" label="区域">
                <el-select
                    v-model="info_form.zone"
                    placeholder="请选择存放区域"
                    style="width: 200px"
                >
                    <el-option
                        v-for="item in alphabet"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                </el-select>
            </el-form-item>
            <el-form-item prop="img" label="图片">
                <el-upload
                    v-model:file-list="info_form.img"
                    capture="environment"
                    :action="upload_url"
                    list-type="picture-card"
                    :on-preview="handlePictureCardPreview"
                    :on-success="()=> info_form_btn=false"
                    :on-error="upload_error"
                    :on-progress="()=> {info_form_btn=true}"
                    :data="upload_data"
                >
                    <el-icon>
                        <Plus/>
                    </el-icon>
                </el-upload>
            </el-form-item>
            <el-form-item prop="tip" label="备注">
                <el-input type="textarea" v-model="info_form.tip" placeholder="无法以个数统计的可以在此注明单位"
                          show-word-limit maxlength="150"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="goodsApplyDialogInit">取消</el-button>
                <el-button type="primary" @click="info_form_check(info_form_ref)">确认
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

.el-button + .el-button {
    margin-left: 0;
}

.dropdown-container {
    display: flex;
    flex-wrap: wrap; /* 允许换行 */
    gap: 10px; /* 设置子元素之间的间距 */
}
</style>