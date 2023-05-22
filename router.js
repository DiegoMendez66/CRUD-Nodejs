const express = require('express');
const router = express.Router();
const conexion = require('./database/db');
const multer = require('multer');
const { uploadFile, AWS_BUCKET_NAME, client } = require('./s3');
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
});
  
const upload = multer({ storage: storage });

// Ruta para subir una imagen
router.post('/upload', upload.single('imagen'), async(req, res) => {
});

router.get('/', (req, res)=>{     
    conexion.query('SELECT * FROM productos',(error, results)=>{
        if(error){
            throw error;
        } else {                       
            res.render('index.ejs', {results:results});            
        }   
    })
})

router.get('/create', (req,res)=>{
    res.render('create');
})

router.get('/edit/:id', (req,res)=>{    
    const id = req.params.id;
    conexion.query('SELECT * FROM productos WHERE id=?',[id] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('edit.ejs', {prod:results[0]});            
        }        
    });
});

router.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    conexion.query('SELECT imagen FROM productos WHERE id = ?', [id], (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
      } else {
        if (results.length > 0) {
          const nombreImagen = results[0].imagen;
  
          // Eliminar la imagen del bucket
          eliminarImagenDelBucket(nombreImagen)
            .then(() => {
              // Eliminar el registro de la base de datos
              conexion.query('DELETE FROM productos WHERE id = ?', [id], (error, results) => {
                if (error) {
                  console.log(error);
                  res.status(500).send('Error en el servidor');
                } else {
                  res.redirect('/');
                }
              });
            })
            .catch((error) => {
              console.log(error);
              res.status(500).send('Error en el servidor');
            });
        } else {
          res.status(404).send('No se encontró el producto');
        }
      }
    });
  });
  
  async function eliminarImagenDelBucket(nombreImagen) {
    const deleteParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: nombreImagen,
    };
  
    try {
      await client.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
      throw new Error('Error al eliminar la imagen del bucket');
    }
  }
  

const crud = require('./controllers/crud');

router.post('/save', upload.single('imagen') ,crud.save);
router.post('/update', upload.single('imagen'), crud.update);

module.exports = router;