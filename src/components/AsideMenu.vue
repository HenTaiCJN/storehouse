<script setup lang="ts">
import {
    HomeFilled,
    Menu as IconMenu,
    Operation,
    UserFilled,
    InfoFilled,
    Close,
    BrushFilled
} from '@element-plus/icons-vue'
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {ElLoading, ElMessage, FormInstance} from "element-plus";
import axios from "axios";
import eventBus from '@/EventBus'

const {appContext: {config: {globalProperties}}} = getCurrentInstance()
const api = globalProperties.$api
const permission=ref(-1)

onMounted(() => {
    login_keep()
})


const emits = defineEmits(['onclick', 'CloseAll']);
const index_dict = {
    "1": ["欢迎", "Welcome"], "3-1": ["货物管理", "GoodsManage"],"3-2": ["货物记录", "GoodsRecord"],"3-3": ["申请记录", "ApplyManage"],
    "3-4":["生产管理","ProduceManage"]
}



//监听菜单栏点击事件
const handleClick = (index: string, indexPath: string[], item: any) => {
    if (!(index in index_dict)) return
    emits('onclick', index_dict[index])
}

//菜单栏开关设置
const isCollapse = ref(false)

//      用户登录的表单
const dialog_user_login = ref(false)
const login_form_ref = ref<FormInstance>()
const login_form = reactive({username: "", password: ""})
const login_form_rules = reactive({
    username: [
        {required: true, message: '请输入用户名称', trigger: 'blur'},
    ],
    password: [
        {required: true, message: '请输入密码', trigger: 'blur'},
    ],
})


const logging_in = ref(false)
const is_login = ref(false)
const username = ref('')

async function login_form_check(formEl: FormInstance | undefined) {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            login()
        } else {
            console.log('error submit!', fields)
            return
        }
    })
}

function login_init() {
    if (logging_in.value) return
    login_form_ref.value.resetFields()
    dialog_user_login.value = false
}

function login() {
    interface data {
        status: string,
        msg: { token: string, permission: string ,goodsLevel: number}
    }

    logging_in.value = true
    axios.post(`${api}/login`, {
        username: login_form.username,
        password: login_form.password
    }).then((res) => {
        let data: data = res.data
        switch (data.status) {
            case "501": {
                ElMessage({type: "error", message: "登录失败"})
                break
            }
            case "405": {
                ElMessage({type: "error", message: "用户不存在"})
                break
            }
            case "401": {
                ElMessage({type: "error", message: "密码错误"})
                break
            }
            case "200": {
                username.value = login_form.username
                permission.value=parseInt(data.msg.permission)
                localStorage.setItem('storehouse_token', data.msg.token)
                localStorage.setItem('storehouse_permission', data.msg.permission)
                localStorage.setItem('storehouse_goodsLevel', String(data.msg.goodsLevel))
                login_form_ref.value.resetFields()
                is_login.value = true
                dialog_user_login.value = false
                ElMessage({type: "success", message: "登录成功"})
                eventBus.publish('login')
                break
            }
        }
        console.log(res)
        logging_in.value = false
    }).catch((e) => {
        console.log(e)
        ElMessage({type: "error", message: "登录失败"})
        logging_in.value = false
    })
}

function logout() {
    is_login.value = false
    username.value = ''
    localStorage.removeItem('storehouse_token')
}

function login_keep() {
    let token = localStorage.getItem('storehouse_token')
    if (token == null) return
    axios.post(`${api}/login_keep`, {
        token: token
    }).then((res) => {
        if (res.data.status !== "200") {
            dialog_user_login.value = true
            return
        }
        dialog_user_login.value = false
        is_login.value = true
        username.value = res.data.msg.username
        permission.value=parseInt(res.data.msg.permission)
        localStorage.setItem('storehouse_permission', res.data.msg.permission)
        localStorage.setItem('storehouse_goodsLevel', String(res.data.msg.goodsLevel))
    }).catch((e) => {
        dialog_user_login.value = true
        console.log(e)
        localStorage.removeItem('storehouse_token')
    })
}
</script>

<template>
    <h5 class="mb-2">仓管系统</h5>
    <el-button @click="isCollapse?isCollapse=false:isCollapse=true" style="margin-left: 0.5vw;">
        <el-icon>
            <Operation/>
        </el-icon>
    </el-button>
    <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        @select="handleClick"
        :collapse="isCollapse"

    >
        <el-menu-item index="1">
            <el-icon>
                <HomeFilled/>
            </el-icon>
            <span>主页</span>
        </el-menu-item>
        <el-menu-item index="2" @click="is_login?null : dialog_user_login=true">
            <el-icon>
                <UserFilled/>
            </el-icon>
            <span v-if="!is_login">用户登录</span>
            <span v-else>
                <span>{{ username }}</span>
                <el-popconfirm
                    width="220"
                    confirm-button-text="确认"
                    cancel-button-text="取消"
                    :icon="InfoFilled"
                    icon-color="#626AEF"
                    title="确认退出?"
                    @confirm="logout"
                >
                    <template #reference>
                        <el-icon color="red">
                            <Close/>
                        </el-icon>
                    </template>
                </el-popconfirm>
            </span>
        </el-menu-item>
        <el-sub-menu index="3" :disabled="!is_login">
            <template #title>
                <el-icon>
                    <icon-menu/>
                </el-icon>
                <span>工具箱</span>
            </template>
            <el-menu-item index="3-1">货物管理</el-menu-item>
            <el-menu-item index="3-4">生产管理</el-menu-item>
            <el-menu-item index="3-2" v-if="permission>0">货物记录</el-menu-item>
            <el-menu-item index="3-3">申请记录</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="4" :disabled="!(username==='admin')" v-if="false">
            <el-icon>
                <BrushFilled/>
            </el-icon>
            <span>账号管理</span>
        </el-menu-item>
    </el-menu>

    <!--    用户登录Dialog-->
    <el-dialog
        v-model="dialog_user_login"
        id="dialog_login"
        title="登录"
        :show-close="false"
        :before-close="(done: () => void) => {login_init()}"
        style="width: 30%;max-width: 500px;min-width: 300px;"
    >
        <el-form :model="login_form" :rules="login_form_rules" ref="login_form_ref">
            <el-form-item prop="username">
                <el-input type="text" v-model="login_form.username" placeholder="用户名"/>
            </el-form-item>
            <el-form-item prop="password">
                <el-input type="password" v-model="login_form.password" placeholder="密码"/>
            </el-form-item>
        </el-form>
        <el-button @click="login_init()" :disabled="logging_in">取消</el-button>
        <el-button type="primary" @click="login_form_check(login_form_ref)"
                   :disabled="logging_in" :loading="logging_in">登录
        </el-button>
    </el-dialog>
</template>

<style scoped>
</style>