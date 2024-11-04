import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)

// app.config.globalProperties.$api='http://127.0.0.1:9010'
app.config.globalProperties.$api='https://cloud.leihoorobot.com/api/storehouse'
app.use(ElementPlus)
app.mount('#app')