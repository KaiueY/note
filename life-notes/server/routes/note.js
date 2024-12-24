const router = require('@koa/router')()
const { typeFind, idFind,insertNote } = require('../controllers/index.js')
const jwt = require('../utils/jwt.js')
const { formateTime} = require('../utils/formatetime.js')
const fs = require('fs');
const path = require('path');


router.get('/findNoteListByType', jwt.verify(), async (ctx, next) => {
    const { noteType } = ctx.query
    // console.log(noteType);
    // console.log(result);
    try {
        const result = await typeFind(noteType, ctx.userid)
        //  console.log(result);
        if (result.length) {
            ctx.body = {
                code: '800',
                data: result,
                msg: 'success'
            }
        }
        else {//不存在数据
            ctx.body = {
                code: '805',
                msg: '没有此类数据！',
                data: 'error'
            }
        }
    } catch (error) {
        ctx.body = {
            code: '806',
            data: error,
            msg: '服务器异常！'
        }
    }
})

// 根据id查找数据
router.get('/findNoteDetail', jwt.verify(), async (ctx, next) => {
    const { id } = ctx.query

    try {
        const result = await idFind(id)
        //  console.log(result);
        if (result.length) {
            ctx.body = {
                code: '800',
                data: result,
                msg: 'success'
            }
        }
        else {//不存在数据
            ctx.body = {
                code: '805',
                msg: '暂无数据～',
                data: 'error'
            }
        }
    } catch (error) {
        ctx.body = {
            code: '806',
            data: error,
            msg: '服务器异常！'
        }
    }
})

// 插入数据
router.post('/note-publish', jwt.verify(), async (ctx, next) => {
    const { title, note_content, head_img, note_type } = ctx.request.body
    const c_time= formateTime(new Date())
    const m_time= formateTime(new Date())


    try {
        const result = await insertNote({
            title,
            note_content,
            c_time,
            m_time,
            head_img,
            note_type,
            userid: ctx.userid,
            nickname:ctx.nickname
        })
        if(result.affectedRows){
            ctx.body = {
            code: '800',
            data: 'success',
            msg: '发布成功！'
        }

        }
        else{
            ctx.body = {
                code: '800',
                data: 'filed',
                msg: '发布失败！'
            }
        }
        // console.log(result);
        
    } catch (error) {
        ctx.body = {
            code: '806',
            data: error,
            msg: '服务器异常！'
        }
    }
})

// 处理分片上传
router.post('/upload-chunk', jwt.verify(), async (ctx, next) => {
  const { chunk, index, filename } = ctx.request.files;
  const chunksDir = path.join(__dirname, '../uploads/chunks');
  
  // 确保目录存在
  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }

  // 保存分片
  const chunkPath = path.join(chunksDir, `${filename}.${index}`);
  const reader = fs.createReadStream(chunk.path);
  const writer = fs.createWriteStream(chunkPath);
  
  await new Promise((resolve, reject) => {
    reader.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  ctx.body = {
    code: '800',
    msg: '分片上传成功'
  };
});

// 合并分片
router.post('/merge-chunks', jwt.verify(), async (ctx, next) => {
  const { filename, totalChunks } = ctx.request.body;
  const chunksDir = path.join(__dirname, '../uploads/chunks');
  const uploadDir = path.join(__dirname, '../uploads');
  const filePath = path.join(uploadDir, filename);

  // 确保上传目录存在
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 合并文件
  const writeStream = fs.createWriteStream(filePath);
  
  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(chunksDir, `${filename}.${i}`);
    const chunkContent = fs.readFileSync(chunkPath);
    writeStream.write(chunkContent);
    // 删除分片
    fs.unlinkSync(chunkPath);
  }
  
  writeStream.end();

  ctx.body = {
    code: '800',
    data: {
      filePath: `/uploads/${filename}`
    },
    msg: '文件合并成功'
  };
});

module.exports = router
