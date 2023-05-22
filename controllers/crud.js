//Invocamos a la conexion de la DB
const conexion = require('../database/db');
const { uploadFile, AWS_BUCKET_NAME, client } = require('../s3');
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");


//GUARDAR un REGISTRO
exports.save = async (req, res) => {
    const nombre = req.body.nombre;
    const marca = req.body.marca;
    const precio = req.body.precio;
    const cantidad = req.body.cantidad;
    const imagen = req.file.filename;

    const prod = {
        nombre: nombre,
        marca: marca,
        precio: precio,
        cantidad: cantidad,
        imagen: imagen
    };

    await uploadFile(req.file, prod);
    conexion.query('INSERT INTO productos SET ?',{nombre:nombre, marca:marca, precio:precio, cantidad:cantidad, imagen:imagen}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.redirect('/');         
        }
    });
};

//ACTUALIZAR un REGISTRO
exports.update = async (req, res) => {
    const id = req.body.id;
    const nombre = req.body.nombre;
    const marca = req.body.marca;
    const precio = req.body.precio;
    const cantidad = req.body.cantidad;
    const nuevaImagen = req.file.filename;
  
    try {
      // Obtener el nombre de la imagen anterior desde la base de datos
      const nombreImagenAnterior = await obtenerNombreImagenAnteriorDesdeBD(id);
  
      // Eliminar la imagen anterior del bucket
      await eliminarImagenDelBucket(nombreImagenAnterior);
  
      const prod = {
        nombre: nombre,
        marca: marca,
        precio: precio,
        cantidad: cantidad,
        imagen: nuevaImagen
    };

    // Cargar la nueva imagen en el bucket
    await uploadFile(req.file, prod);
  
      // Actualizar la información del producto en la base de datos
      const query = 'UPDATE productos SET ? WHERE id = ?';
      const values = {
        nombre: nombre,
        marca: marca,
        precio: precio,
        cantidad: cantidad,
        imagen: nuevaImagen,
      };
  
      conexion.query(query, [values, id], (error, results) => {
        if (error) {
          console.log(error);
        } else {
          res.redirect('/');
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('Error en el servidor');
    }
  };
  
  async function obtenerNombreImagenAnteriorDesdeBD(id) {
    return new Promise((resolve, reject) => {
      conexion.query(
        'SELECT imagen FROM productos WHERE id = ?',
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            if (results.length > 0) {
              resolve(results[0].imagen);
            } else {
              reject('No se encontró el producto');
            }
          }
        }
      );
    });
  }
  
  async function eliminarImagenDelBucket(nombreImagen) {
    const deleteParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: nombreImagen,
    };
  
    await client.send(new DeleteObjectCommand(deleteParams));
  }
  
  