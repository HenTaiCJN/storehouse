<script setup lang="ts">
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import {Plus} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox, FormInstance, UploadProps} from "element-plus";
import axios from "axios";

const {appContext: {config: {globalProperties}}} = getCurrentInstance()
const api = globalProperties.$api
const userGoodsLevel = parseInt(localStorage.getItem("storehouse_goodsLevel"))
const userPermission = parseInt(localStorage.getItem("storehouse_permission"))

onMounted(() => {
    init()
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
                imgUrl: `https://cloud.leihoorobot.com/w/${i.imgUrl}`,
                number: parseFloat(i.number),
                tip: i.tip,
                zone: i.zone
            })
            nameList.value.push({value: i.name})
            typeList.value.push({value: i.type})
        }
        tableData.value = tmp
    }).catch(e => {
        console.error(e);
    })
}

const add_dialog = ref(false)
const add_form_btn = ref(true)
const add_form_ref = ref<FormInstance>()
const add_form = reactive({name: "", type: "", goodsLevel: 1, img: [], zone: "", number: null, tip: ""})
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
    let nameFind = nameList.value.find(i => i.value === add_form.name)
    let typeFind = typeList.value.find(i => i.value === add_form.type)
    if (nameFind && typeFind) {
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

function __________() {
}

const video_upload_dialog = ref(false)
let mediaStream2: any

function video_upload() {
    let v = document.getElementById('videoUpload')
    //获取摄像头并将视频流附加到video标签上
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: {exact: "environment"}
        }
    }).then(stream => {
        mediaStream2 = stream;
        v.srcObject = stream;
    }).catch(error => {
        console.error('Error accessing webcam:', error);
    });
}

function video_upload_stop() {
    if (mediaStream2) {
        mediaStream2.getTracks().forEach(track => {
            track.stop(); // 终止媒体流轨道
        });
    }
}

function video_cap() {

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
        tip: ''
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
        {validator: numberCheck, trigger: 'change'}
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

function numberCheck(rule: any, value: any, callback: any) {
    const regex = /^\d+(\.\d+)?$/;
    if (!regex.test(value)) callback(new Error('请输入正确的数字'));
    let newValue = parseFloat(value)
    if (newValue > curRow.number) callback(new Error('请输入正确的数字'));
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
        {validator: numberCheck, trigger: 'change'}
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
        {validator: numberCheck, trigger: 'change'}
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

</script>

<template>
    <div>
        <h1>
            货物管理
        </h1>
    </div>
    <div>
        <el-button class="mt-4" type="success" style="width: 100%" @click="add_dialog=true;">添加新货物</el-button>
        <el-table :data="filterTableData" table-layout="auto">
            <el-table-column fixed prop="id" label="id" sortable/>
            <el-table-column prop="name" label="名称" sortable/>
            <el-table-column prop="type" label="型号" sortable/>
            <el-table-column prop="imgUrl" label="图片" width="150" sortable>
                <template #default="scope">
                    <img class="imgInTable" :src="scope.row.imgUrl"
                         alt="" @click="openBigImg(scope.row.imgUrl)"/>
                </template>
            </el-table-column>
            <el-table-column prop="zone" label="区域" sortable/>
            <el-table-column prop="number" label="数量" sortable/>
            <el-table-column prop="tip" label="备注" sortable/>
            <el-table-column fixed="right" label="操作">
                <template #header>
                    <el-input v-model="search" size="small" placeholder="搜索"/>
                </template>
                <template #default="scope">
                    <el-button v-if="userPermission>0 && userGoodsLevel>=scope.row.goodsLevel"
                               type="primary" size="small" @click="startGoodsOut(scope.row)">出库
                    </el-button>
                    <el-button v-if="userPermission>0"
                               type="success" size="small" @click="startGoodsIn(scope.row)">入库
                    </el-button>
                    <el-button type="primary" size="small" @click="startGoodsApply(scope.row)">申请取货</el-button>
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
        v-model="add_dialog"
        title="添加新货物"
        width="30%"
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
                    v-model="add_form.zone"
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
<!--                <el-button type="primary" @click="video_upload_dialog=true">拍摄上传</el-button>-->
                <el-upload
                    v-model:file-list="add_form.img"
                    :action="upload_url"
                    list-type="picture-card"
                    :on-preview="handlePictureCardPreview"
                    :on-success="()=> add_form_btn=false"
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
        width="30%"
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
        width="30%"
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
        width="30%"
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
        v-model="video_upload_dialog"
        title="拍摄"
        width="30%"
        @opened="video_upload"
        @closed="video_upload_stop"
    >
        <div style="display: flex;justify-content: center">
            <el-button type="primary" @click="video_cap">拍摄</el-button>
        </div>

        <div style="margin-top: 10px">
            <video id="videoUpload" style="max-width: 100%; height: auto;" autoplay loop></video>
        </div>

    </el-dialog>
</template>

<style scoped>
.imgInTable {
    width: 100%;
}
</style>