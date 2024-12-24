<template>
    <div class="note-publish">
      <div class="editor">
        <QuillEditor theme="snow" v-model:content="state.content" placeholder="请输入笔记内容" contentType="html" />
      </div>
  
      <div class="note-wrap">
        <div class="note-cell">
          <van-field v-model="state.title" label="标题" placeholder="请输入标题" />
        </div>
  
        <div class="note-cell">
          <van-field label="图片上传">
            <template #input>
              <van-uploader v-model="state.img" :after-read="afterRead" max-count="1" />
            </template>
          </van-field>
  
        </div>
  
        <div class="note-cell">
          <div class="sort" @click="showPicker = true">
            <span>分类</span>
            <span>{{state.note_type}} <van-icon name="arrow" /></span>
          </div>
  
          <van-popup 
            v-model:show="showPicker" 
            round 
            position="bottom"
          >
            <van-picker 
              :columns="columns" 
              @cancel="showPicker = false" 
              @confirm="onConfirm" />
          </van-popup>
        </div>
  
      </div>
  
      <div class="btn">
        <van-button 
        
        color="linear-gradient(to right, #4672b3, #ee5a24)"
        @click="publish" 
        block>
        发布</van-button>

      </div>
    </div>
  </template>
  
  <script setup>
  import { QuillEditor } from '@vueup/vue-quill'
  import '@vueup/vue-quill/dist/vue-quill.snow.css';
  import { reactive, ref } from 'vue';
  import axios from '@/api'
  import { useRouter } from 'vue-router';
import { showToast } from 'vant';


  const router = useRouter()
  const state = reactive({
    content: '',
    title: '',
    img: [],
    note_type: '美食'
  })
  
  const afterRead = async (file) => {
    const chunkSize = 1024 * 512; // 1MB per chunk
    const chunks = [];
    const totalChunks = Math.ceil(file.file.size / chunkSize);
    
    // 将文件分片
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.file.size);
      const chunk = file.file.slice(start, end);
      chunks.push(chunk);
    }

    // 上传每个分片
    for (let i = 0; i < chunks.length; i++) {
      const formData = new FormData();
      formData.append('chunk', chunks[i]);
      formData.append('index', i);
      formData.append('total', totalChunks);
      formData.append('filename', file.file.name);

      try {
        await axios.post('/upload-chunk', formData);
      } catch (error) {
        showToast('上传失败');
        return;
      }
    }

    // 请求合并文件
    const res = await axios.post('/merge-chunks', {
      filename: file.file.name,
      totalChunks
    });

    if (res.code === '800') {
      state.img = [{
        content: res.data.filePath
      }];
    }
  }
  
  const showPicker = ref(false)
  const columns = [
    { text: '美食', value: '美食' },
    { text: '旅行', value: '旅行' },
    { text: '恋爱', value: '恋爱' },
    { text: '学习', value: '学习' },
    { text: '吵架', value: '吵架' },
  ]
  const onConfirm = ({selectedValues}) => {
    state.note_type = selectedValues[0]
    showPicker.value = false
  }
  
  // 发布
  const publish = async() => {
    if (!state.content && !state.title && state.img.length === 0) {
        showToast('请填写完整信息');
        return;
    }
    const res = await axios.post('/note-publish', {
      title: state.title,
      note_content: state.content,
      head_img: state.img.length ? state.img[0].content : '',
      note_type: state.note_type
    })
    router.push('/noteClass')
  }
  
  </script>
  
  <style lang="less" scoped>
  .note-publish {
    min-height: 100vh;
  
    :deep(.ql-container) {
      height: 200px;
    }
  
    .note-cell {
      border-bottom: 1px solid #d1d5db;
  
      .sort {
        display: flex;
        justify-content: space-between;
        line-height: 3;
        padding: 3px 16px;
        color: #323233;
      }
    }
  
    .btn{
      width: 80%;
      margin: 0 auto;
      margin-top: 2rem;
    }
  }
  </style>