require('dotenv').config()
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const fs = require('fs')

const AWS_PUBLIC_KEY=process.env.AWS_PUBLIC_KEY
const AWS_SECRET_KEY=process.env.AWS_SECRET_KEY
const AWS_BUCKET_NAME=process.env.AWS_BUCKET_NAME
const AWS_BUCKET_REGION=process.env.AWS_BUCKET_REGION

const client = new S3Client({ region: AWS_BUCKET_REGION,
    credentials : {
        accessKeyId: AWS_PUBLIC_KEY,
        secretAccessKey: AWS_SECRET_KEY
    }
});

async function uploadFile(file, prod) {
    const stream = fs.createReadStream(file.path);
    const uploadParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: file.originalname,
      Body: stream,
    };
    const command = new PutObjectCommand(uploadParams);
    const result = await client.send(command);
    
    // Obtén la URL del objeto cargado en AWS S3
    const imageUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_BUCKET_REGION}.amazonaws.com/${file.originalname}`;
    
    // Asigna la URL del objeto al objeto prod
    prod.imagen = imageUrl;
    
    return result;
  }
  

module.exports = {
    uploadFile,
    AWS_BUCKET_NAME,
    client,
}