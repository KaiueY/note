import 'lib-flexible/flexible'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/assets/reset.css'
import { Button ,Form,Field,CellGroup,Toast,Loading,Icon,Uploader,Picker,Popup,SwipeItem ,Swipe  } from 'vant'
import 'vant/lib/index.css';


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Button)
app.use(Form)
app.use(Loading )
app.use(Toast)
app.use(Field)
app.use(Icon )
app.use(Picker )
app.use(Popup)
app.use(Swipe)

app.use(SwipeItem)
app.use(Uploader )
app.use(CellGroup)

app.mount('#app')
